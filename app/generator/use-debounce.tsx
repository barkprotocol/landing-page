import { useDebounce } from 'use-debounce';

function BlinkboardComponent() {
  const [value, setValue] = useState('');
  const [debouncedValue] = useDebounce(value, 300);

  // Use debouncedValue in your effect or callback
  useEffect(() => {
    // This effect will only run 300ms after the last change to `value`
  }, [debouncedValue]);

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}