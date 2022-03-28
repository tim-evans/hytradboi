export function withLogger(Component) {
  return ({ annotation, ancestors, $highlight, children }) => {
    return (
      <Component
        className={`${annotation.type}_${annotation.start}-${annotation.end}`}
        onClick={(evt) => {
          let ancestry = ancestors();
          for (let i = ancestry.length - 1; i >= 0; i--) {
            let ancestor = ancestry[i];
            console.group(
              `${ancestor.type} [${ancestor.start}, ${ancestor.end}]`,
              ancestor.attributes
            );
          }
          for (let i = ancestry.length - 1; i >= 0; i--) {
            console.groupEnd();
          }
          evt.preventDefault();
          evt.stopPropagation();
        }}
        $highlight={$highlight}
      >
        {children}
      </Component>
    );
  };
}
