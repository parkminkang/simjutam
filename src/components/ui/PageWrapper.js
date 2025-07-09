// src/components/ui/PageWrapper.js
function PageWrapper({ children }) {
  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      {children}
    </div>
  );
}

export default PageWrapper;
