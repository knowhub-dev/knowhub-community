export function FloatingBlobs() {
  const blobs = [
    { style: { top: '-40px', left: '-60px', animationDuration: '18s' } },
    { style: { top: '20%', right: '-80px', animationDuration: '20s', animationDelay: '2s' } },
    { style: { bottom: '-50px', left: '10%', animationDuration: '16s', animationDelay: '1s' } },
    { style: { top: '45%', right: '25%', animationDuration: '19s', animationDelay: '3s' } },
  ];

  return (
    <div className="floating-blobs" aria-hidden>
      {blobs.map((blob, index) => (
        <div key={`floating-blob-${index}`} className="blob" style={blob.style} />
      ))}
    </div>
  );
}
