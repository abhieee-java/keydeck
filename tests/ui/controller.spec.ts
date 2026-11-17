import { test, expect } from "@playwright/test";
test("preview connects, sends text, composes commands, and disconnects", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText("Small device. Full control.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Left click", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Connect computer", exact: true })
    .click();
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await page.getByRole("button", { name: "Start controlling" }).click();
  await expect(page.getByText("Simulated", { exact: true })).toBeVisible();
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
  await expect(page.getByText("No computer connected")).toBeVisible();
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
    page.getByRole("button", { name: "Touchpad", exact: true }),
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
  await expect(page.getByText("Simulated", { exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByLabel("Quick type text")).toHaveValue(
    "Keep this draft",
  );
});
