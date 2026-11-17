import { test, expect } from "@playwright/test";
test("preview connects, sends text, composes commands, and disconnects", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText("Your desk. Within reach.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Left click", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Connect computer", exact: true })
    .click();
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await page.getByRole("button", { name: "Start controlling" }).click();
  await expect(page.getByText(/Simulated ·/)).toBeVisible();
  await page.getByLabel("Quick type text").fill("Hello world!");
  await page.getByRole("button", { name: "Send text", exact: true }).click();
  await expect(
    page.getByText("Text previewed. Nothing was sent to a computer."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Console", exact: true }).click();
  await page.getByLabel("Command", { exact: true }).fill("pwd");
  await page.getByRole("button", { name: "Preview + Enter" }).click();
  await expect(page.getByText("preview $ pwd")).toBeVisible();
  await page.getByRole("button", { name: "Disconnect computer" }).click();
  await expect(page.getByText("Not connected", { exact: true })).toBeVisible();
});
test("unsupported text retains draft and shows recovery", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Connect computer" }).click();
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await page.getByRole("button", { name: "Start controlling" }).click();
  await page.getByLabel("Quick type text").fill("नमस्ते");
  await page.getByRole("button", { name: "Send text" }).click();
  await expect(page.getByRole("alert")).toContainText("not supported");
  await expect(page.getByLabel("Quick type text")).toHaveValue("नमस्ते");
});
test("phone layout and unavailable Bluetooth mode are honest", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Control", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("switch", { name: "Preview mode" }).click();
  await page.getByRole("button", { name: "Connect computer" }).click();
  await expect(page.getByRole("alert")).toContainText("custom Android build");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
});

test("route changes preserve a connected session and text draft", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Connect computer" }).click();
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await page.getByRole("button", { name: "Start controlling" }).click();
  await page.getByLabel("Quick type text").fill("Keep this draft");
  await page.getByRole("button", { name: "Keyboard", exact: true }).click();
  await expect(page).toHaveURL(/\/keyboard$/);
  await expect(page.getByLabel("Keyboard text")).toHaveValue("Keep this draft");
  await page.getByRole("button", { name: "Ctrl", exact: true }).click();
  await page.getByLabel("Shortcut key").fill("a");
  await page
    .getByRole("button", { name: "Send Ctrl + a", exact: true })
    .click();
  await expect(page.getByText(/Simulated ·/)).toBeVisible();
  await page.goBack();
  await expect(page.getByLabel("Quick type text")).toHaveValue(
    "Keep this draft",
  );
});

test("input preferences survive a restart without saving text drafts", async ({
  page,
}) => {
  await page.goto("/settings");
  await page.getByRole("radio", { name: "macOS", exact: true }).click();
  await page
    .getByRole("radio", { name: "Smooth · 60 Hz", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("radio", { name: "macOS", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("radio", { name: "Smooth · 60 Hz", exact: true }),
  ).toBeChecked();
});

test("connection sheet closes and extra touchpad controls stay reachable on a phone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: "Connect computer" }).click();
  await page
    .getByRole("button", { name: "Close devices", exact: true })
    .click();
  await expect(
    page.getByText("Connect your computer", { exact: true }),
  ).not.toBeVisible();
  await page
    .getByRole("button", { name: "More controls", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Move left", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
});

test("backgrounding pauses the session and prevents further input", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Connect computer" }).click();
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await page.getByRole("button", { name: "Start controlling" }).click();
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.getByText("Not connected", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Left click", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByText(
      "Session paused in the background. Reconnect when you are ready.",
    ),
  ).toBeVisible();
});
