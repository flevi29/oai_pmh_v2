<script lang="ts">
  const {
    value = "",
    placeholder,
    timeout = 700,
    onValueChanged,
    class: inputClass,
  }: {
    value?: string;
    placeholder?: string;
    timeout?: number;
    onValueChanged: (value: string) => void;
    class?: string;
  } = $props();

  let to: ReturnType<typeof setTimeout> | null = null;

  function changeValueWithDebounce(value: string): void {
    if (to !== null) {
      clearTimeout(to);
    }

    to = setTimeout(() => {
      to = null;
      onValueChanged(value);
    }, timeout);
  }

  function changeValue(value: string): void {
    if (to !== null) {
      clearTimeout(to);
    }

    onValueChanged(value);
  }
</script>

<input
  type="text"
  spellcheck="false"
  {value}
  {placeholder}
  class={inputClass}
  oninput={(event) => changeValueWithDebounce(event.currentTarget.value)}
  onfocusout={(event) => changeValue(event.currentTarget.value)}
/>
