export function withLogger(Component) {
  return ({ annotation, $highlight, children }) => {
    return (
      <Component
        className={`${annotation.type}_${annotation.start}-${annotation.end}`}
        onClickCapture={() => {
          console.group(
            `${annotation.type} [${annotation.start}, ${annotation.end}]`,
            annotation.attributes
          );
        }}
        onClick={() => {
          console.groupEnd();
        }}
        $highlight={$highlight}
      >
        {children}
      </Component>
    );
  };
}
