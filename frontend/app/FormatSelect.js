export default function FormatSelect({ formats, onDownload }) {
  return (
    <div>
      <select id="formatSelect">
        {formats.map((f) => (
          <option key={f.format_id} value={f.format_id}>
            {f.resolution || f.ext} ({f.type})
          </option>
        ))}
      </select>
      <button
        onClick={() => {
          const format_id = document.getElementById("formatSelect").value;
          onDownload(format_id);
        }}
      >
        Download Selected
      </button>
    </div>
  );
}
