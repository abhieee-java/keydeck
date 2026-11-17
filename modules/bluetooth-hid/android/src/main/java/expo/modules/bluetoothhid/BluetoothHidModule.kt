package expo.modules.bluetoothhid

import android.annotation.SuppressLint
import android.bluetooth.*
import android.content.Context
import android.content.Intent
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.concurrent.Executors
import kotlinx.coroutines.delay

/** Android's HID device profile; the computer sees a composite keyboard + mouse. */
@SuppressLint("MissingPermission")
class BluetoothHidModule : Module() {
  private var adapter: BluetoothAdapter? = null
  private var hid: BluetoothHidDevice? = null
  @Volatile private var host: BluetoothDevice? = null
  @Volatile private var connectingDevice: BluetoothDevice? = null
  @Volatile private var registered = false
  @Volatile private var pending = false
  @Volatile private var reconnectDevice: BluetoothDevice? = null
  @Volatile private var registrationError: String? = null
  private var revision = 0L
  private val executor = Executors.newSingleThreadExecutor()
  private val reportLock = Any()
  @Volatile private var generation = 0
  @Synchronized private fun state(status: String, device: BluetoothDevice? = null, message: String? = null) {
    val event = snapshot(status, device, message)
    sendEvent("onConnection", event)
  }
  @Synchronized private fun snapshot(
    status: String = if (host != null) "connected" else if (connectingDevice != null) "connecting" else if (registered) "ready" else "idle",
    device: BluetoothDevice? = host ?: connectingDevice,
    message: String? = null
  ): Map<String, Any> {
    val event = mutableMapOf<String, Any>("status" to status, "revision" to ++revision)
    device?.let { event["device"] = mapOf("id" to it.address, "name" to (it.name ?: "Computer")) }
    message?.let { event["message"] = it }
    return event
  }
  @Synchronized private fun reconcile(): Map<String, Any> {
    val actual = hid?.connectedDevices?.firstOrNull()
    if (actual != null) { host = actual; reconnectDevice = actual; connectingDevice = null }
    else if (host != null) { generation++; host = null }
    return snapshot()
  }
  private val callback = object : BluetoothHidDevice.Callback() {
    override fun onAppStatusChanged(pluggedDevice: BluetoothDevice?, isRegistered: Boolean) = synchronized<Unit>(this@BluetoothHidModule) {
      registered = isRegistered
      pending = false
      if (!isRegistered) {
        generation++; host = null; connectingDevice = null
        state("idle")
      } else {
        registrationError = null
        // A registration callback may arrive AFTER a connected callback.
        // Preserve the active host, and recover connections made in Android Settings.
        val actual = hid?.connectedDevices?.firstOrNull()
        if (actual != null) { host = actual; reconnectDevice = actual; connectingDevice = null }
        if (host == null && connectingDevice == null) {
          reconnectDevice?.let { device ->
            if (hid?.connect(device) == true) connectingDevice = device
          }
        }
        state(if (host != null) "connected" else if (connectingDevice != null) "connecting" else "ready", host ?: connectingDevice)
      }
    }
    override fun onConnectionStateChanged(device: BluetoothDevice, newState: Int) = synchronized<Unit>(this@BluetoothHidModule) {
      when (newState) {
        BluetoothProfile.STATE_CONNECTED -> {
          connectingDevice = null; host = device; reconnectDevice = device; state("connected", device)
        }
        BluetoothProfile.STATE_CONNECTING -> {
          if (host == null) { connectingDevice = device; state("connecting", device) }
        }
        BluetoothProfile.STATE_DISCONNECTED -> {
          // A delayed disconnect for a different host must not clear the active one.
          if (host?.address == device.address || connectingDevice?.address == device.address) {
            generation++
            if (host?.address == device.address) host = null
            if (connectingDevice?.address == device.address) connectingDevice = null
            state(if (host != null) "connected" else if (registered) "ready" else "idle", host)
          }
        }
      }
    }
    override fun onGetReport(device: BluetoothDevice, type: Byte, id: Byte, bufferSize: Int) {
      val size = if (id.toInt() == 1) 8 else if (id.toInt() == 2) 4 else 0
      if (size > 0 && type == BluetoothHidDevice.REPORT_TYPE_INPUT)
        hid?.replyReport(device, type, id, ByteArray(size))
      else hid?.reportError(device, BluetoothHidDevice.ERROR_RSP_UNSUPPORTED_REQ)
    }
    override fun onSetReport(device: BluetoothDevice, type: Byte, id: Byte, data: ByteArray) {
      // Keyboard LEDs are accepted but not rendered in this foundation.
      hid?.reportError(device, if (id.toInt() == 1) BluetoothHidDevice.ERROR_RSP_SUCCESS else BluetoothHidDevice.ERROR_RSP_UNSUPPORTED_REQ)
    }
    override fun onVirtualCableUnplug(device: BluetoothDevice) = synchronized<Unit>(this@BluetoothHidModule) {
      if (host?.address == device.address) { generation++; host = null; connectingDevice = null; reconnectDevice = null; state("ready") }
    }
  }
  private val serviceListener = object : BluetoothProfile.ServiceListener {
    override fun onServiceConnected(profile: Int, proxy: BluetoothProfile) {
      hid = proxy as BluetoothHidDevice
      register()
    }
    override fun onServiceDisconnected(profile: Int) {
      generation++; host = null; connectingDevice = null; hid = null; registered = false; pending = false
      state("idle", message = "Bluetooth service disconnected. Reconnect to continue.")
    }
  }
  private fun register() {
    val settings = BluetoothHidDeviceAppSdpSettings("Keydeck", "Phone keyboard and mouse", "Keydeck", BluetoothHidDevice.SUBCLASS1_COMBO, descriptor)
    if (hid?.registerApp(settings, null, null, executor, callback) != true) {
      pending = false
      registrationError = "HID registration failed. Close other Bluetooth controller apps and retry."
      state("error", message = registrationError)
    }
  }
  private fun requireHost(): BluetoothDevice = host ?: throw IllegalStateException("No computer connected.")
  private fun send(id: Int, bytes: ByteArray) {
    if (hid?.sendReport(requireHost(), id, bytes) != true) throw IllegalStateException("Bluetooth input failed. Reconnect and retry.")
  }
  private fun releaseReports() {
    val device = host ?: return
    synchronized(reportLock) { hid?.sendReport(device, 1, ByteArray(8)); hid?.sendReport(device, 2, ByteArray(4)) }
  }
  private fun key(modifier: Int, codes: List<Int>) {
    require(codes.size <= 6) { "At most six simultaneous keys are supported." }
    val report = ByteArray(8)
    report[0] = modifier.toByte()
    codes.forEachIndexed { i, code -> report[i + 2] = code.toByte() }
    synchronized(reportLock) {
      try { send(1, report); Thread.sleep(12) } finally { if (host != null) send(1, ByteArray(8)) }
    }
  }
  @Synchronized private fun disconnect() {
    reconnectDevice = null
    generation++
    releaseReports()
    (host ?: connectingDevice)?.let { hid?.disconnect(it) }
    connectingDevice = null
    host = null
  }
  private fun suspendSession() {
    disconnect()
    registered = false
    pending = false
    hid?.unregisterApp()
    state("idle")
  }
  override fun definition() = ModuleDefinition {
    Name("BluetoothHid")
    Events("onConnection")
    AsyncFunction("initialize").SuspendBody<Map<String, Any>> { ->
      check(Build.VERSION.SDK_INT >= 28) { "Android 9 or newer is required." }
      val context = appContext.reactContext ?: throw IllegalStateException("Android context unavailable.")
      adapter = (context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager).adapter
      check(adapter?.isEnabled == true) { "Turn on Bluetooth in Android Settings, then retry." }
      synchronized(this@BluetoothHidModule) {
        if (!registered && !pending) {
          pending = true
          registrationError = null
          if (hid != null) register()
          else if (adapter?.getProfileProxy(context, serviceListener, BluetoothProfile.HID_DEVICE) != true) {
            pending = false
            registrationError = "This phone does not support Bluetooth HID device mode."
          }
        }
      }
      // Wait for the Android callback, not merely for getProfileProxy to return.
      val deadline = android.os.SystemClock.elapsedRealtime() + 10000
      while (!registered && pending && android.os.SystemClock.elapsedRealtime() < deadline) delay(50)
      if (!registered) {
        pending = false
        throw IllegalStateException(registrationError ?: "Bluetooth setup timed out. Turn Bluetooth off and on, then retry.")
      }
      reconcile()
    }
    AsyncFunction("getConnectionState") { reconcile() }
    AsyncFunction("getDevices") {
      val devices: List<Map<String, String>> = adapter?.bondedDevices?.map { device ->
        mapOf("id" to device.address, "name" to (device.name ?: "Bluetooth device"))
      } ?: emptyList<Map<String, String>>()
      devices
    }
    AsyncFunction("makeDiscoverable") {
      val activity = appContext.currentActivity ?: throw IllegalStateException("Open the app before pairing.")
      activity.startActivity(Intent(BluetoothAdapter.ACTION_REQUEST_DISCOVERABLE).putExtra(BluetoothAdapter.EXTRA_DISCOVERABLE_DURATION, 120))
    }
    AsyncFunction("connect") { address: String ->
      synchronized(this@BluetoothHidModule) {
        reconcile()
        check(registered) { "Bluetooth is still preparing. Wait a moment, then try Connect again." }
        if (host?.address != address) {
          check(host == null) { "Disconnect the current computer first." }
          val device = adapter?.bondedDevices?.find { it.address == address } ?: throw IllegalStateException("Pair this computer in Bluetooth Settings first.")
          if (connectingDevice?.address != address) {
            reconnectDevice = device
            connectingDevice = device
            if (hid?.connect(device) != true) {
              connectingDevice = null
              throw IllegalStateException("Connection could not start. Check the computer’s Bluetooth settings.")
            }
          }
        }
        snapshot()
      }
    }
    AsyncFunction("disconnect") { disconnect(); snapshot() }
    AsyncFunction("suspendSession") { suspendSession() }
    AsyncFunction("sendKey") { modifier: Int, codes: List<Int> -> key(modifier, codes) }
    AsyncFunction("sendText").SuspendBody { reports: List<Map<String, Any>> ->
      require(reports.size <= 2001) { "Text is too long." }
      val current = generation
      for (report in reports) {
        check(current == generation) { "Input interrupted. Some text may already have been sent." }
        val modifier = (report["modifier"] as Number).toInt()
        val codes = (report["keys"] as List<*>).map { (it as Number).toInt() }
        key(modifier, codes)
        delay(8)
      }
    }
    AsyncFunction("sendMouse") { x: Int, y: Int, buttons: Int, wheel: Int ->
      synchronized(reportLock) { send(2, byteArrayOf((buttons and 7).toByte(), x.coerceIn(-127,127).toByte(), y.coerceIn(-127,127).toByte(), wheel.coerceIn(-127,127).toByte())) }
    }
    AsyncFunction("release") { generation++; releaseReports() }
    // Pairing/permission dialogs can pause the activity. Release input, not the HID session.
    // Android itself unregisters HID when the app truly leaves the foreground.
    OnActivityEntersBackground { generation++; runCatching { releaseReports() } }
    OnDestroy {
      runCatching { disconnect() }
      runCatching { hid?.unregisterApp() }
      hid?.let { adapter?.closeProfileProxy(BluetoothProfile.HID_DEVICE, it) }
      executor.shutdown()
    }
  }
  companion object {
    // Report 1: boot-style 6-key keyboard + LED output; report 2: 3-button relative mouse + wheel.
    private val descriptor = intArrayOf(
      0x05,0x01, 0x09,0x06, 0xA1,0x01, 0x85,0x01,
      0x05,0x07, 0x19,0xE0, 0x29,0xE7, 0x15,0x00, 0x25,0x01, 0x75,0x01, 0x95,0x08, 0x81,0x02,
      0x95,0x01, 0x75,0x08, 0x81,0x01,
      0x95,0x05, 0x75,0x01, 0x05,0x08, 0x19,0x01, 0x29,0x05, 0x91,0x02,
      0x95,0x01, 0x75,0x03, 0x91,0x01,
      0x95,0x06, 0x75,0x08, 0x15,0x00, 0x25,0x65, 0x05,0x07, 0x19,0x00, 0x29,0x65, 0x81,0x00, 0xC0,
      0x05,0x01, 0x09,0x02, 0xA1,0x01, 0x85,0x02, 0x09,0x01, 0xA1,0x00,
      0x05,0x09, 0x19,0x01, 0x29,0x03, 0x15,0x00, 0x25,0x01, 0x95,0x03, 0x75,0x01, 0x81,0x02,
      0x95,0x01, 0x75,0x05, 0x81,0x01,
      0x05,0x01, 0x09,0x30, 0x09,0x31, 0x09,0x38, 0x15,0x81, 0x25,0x7F, 0x75,0x08, 0x95,0x03, 0x81,0x06,
      0xC0,0xC0
    ).map { it.toByte() }.toByteArray()
  }
}
