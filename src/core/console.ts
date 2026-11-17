/** Extension boundary: HID types commands but cannot read stdout or the screen.
 * A future authenticated computer companion can implement this contract.
 * Do not expose an unauthenticated remote shell. */
export interface ConsoleTransport {
  connect(deviceId: string): Promise<void>;
  execute(command: string): Promise<{ id: string }>;
  onOutput(
    listener: (event: {
      id: string;
      stream: "stdout" | "stderr";
      data: string;
      exitCode?: number;
    }) => void,
  ): () => void;
  interrupt(id: string): Promise<void>;
  disconnect(): Promise<void>;
}
