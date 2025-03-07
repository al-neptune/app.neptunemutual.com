import { useNotifier } from "@/src/hooks/useNotifier";
import { testData } from "@/utils/unit-tests/test-data";
import { mockFn, renderHookWrapper } from "@/utils/unit-tests/test-mockup-fn";

describe("useNotifier", () => {
  const { mock, mockFunction, restore } = mockFn.console.error();
  mockFn.useToast();

  test("should return default hook result", async () => {
    const { result } = await renderHookWrapper(useNotifier);
    expect(typeof result.notifier).toEqual("function");
  });

  test("should execute the notifier function", async () => {
    mock();

    const { result, act } = await renderHookWrapper(useNotifier);

    const notification = {
      type: "error",
      error: "mock error",
      title: "Mock Error Title",
      message: "Mock Error Message",
    };
    await act(() => result.notifier(notification));

    expect(mockFunction).toHaveBeenCalled();
    expect(testData.toast.pushError).toHaveBeenCalled();

    restore();
  });

  test("should return if notification type is not error", async () => {
    mock();

    const { result, act } = await renderHookWrapper(useNotifier);

    const notification = {
      type: "alert",
      error: "mock elert",
      title: "Mock Alert Title",
      message: "Mock Alert Message",
    };
    await act(() => result.notifier(notification));

    restore();
  });
});
