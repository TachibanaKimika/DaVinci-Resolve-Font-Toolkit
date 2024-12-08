export const debounce = (func: Function, wait = 400) => {
  let timeout;
  return function (...args: any) {
    const context = this;
    const later = function () {
      timeout = null;
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}