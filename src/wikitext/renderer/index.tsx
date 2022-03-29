import { createElement, ComponentType, ReactNode } from "react";
import { classify } from "@atjson/renderer-hir";
import { HIR, HIRNode, TextAnnotation } from "@atjson/hir";
import Document, { is, Annotation } from "@atjson/document";
import {
  ReactRendererConsumer,
  ReactRendererProvider,
} from "@atjson/renderer-react";

export { ReactRendererProvider };

export type PropsOf<AnnotationClass> = AnnotationClass extends Annotation<
  infer Attributes
>
  ? {
      [P in keyof Attributes]: Attributes[P] extends Document
        ? React.ReactFragment
        : Attributes[P];
    } & { children?: ReactNode }
  : never;

function propsOf(attributes, slices, transformer) {
  if (Array.isArray(attributes)) {
    return attributes.map((item) => propsOf(item, slices, transformer));
  } else if (typeof attributes === "object") {
    let props = {};
    for (let key in attributes) {
      props[key] = propsOf(attributes[key], slices, transformer);
    }
    return props;
  } else if (typeof attributes === "string") {
    if (attributes.startsWith("slice:")) {
      let sliceId = attributes.slice(6);
      let doc = slices[sliceId];
      // Only work on slices that are in the document
      if (doc != null) {
        return transformer(doc);
      }
    }
  }
  return attributes;
}

function renderNode(props: {
  node: HIRNode;
  ancestors: HIRNode[];
  includeParseTokens: boolean;
  slices: Record<string, Document>;
  key: string;
}) {
  let { node, ancestors, includeParseTokens, slices, key } = props;
  let annotation = node.annotation;
  if (is(annotation, TextAnnotation)) {
    return node.text;
  }

  return createElement(ReactRendererConsumer, {
    key,
    children: (componentMap: { [key: string]: ComponentType<any> }) => {
      let AnnotationComponent =
        componentMap[annotation.type] ||
        componentMap[classify(annotation.type)] ||
        componentMap.Default;

      let childNodes = node.children({ includeParseTokens });
      let children = [];
      for (let i = 0, len = childNodes.length; i < len; i++) {
        children[i] = renderNode({
          node: childNodes[i],
          includeParseTokens,
          slices,
          key: `${node.id}-${i}`,
          ancestors: [...ancestors, node],
        });
      }

      if (AnnotationComponent) {
        return createElement(
          AnnotationComponent,
          {
            ...propsOf(annotation.attributes, slices, (doc) => {
              return render({ document: doc, includeParseTokens, slices });
            }),
            annotation: {
              type: annotation.type,
              start: annotation.start,
              end: annotation.end,
            },
            ancestors() {
              return ancestors.map((ancestor) => ({
                ...ancestor.annotation,
                attributes: propsOf(
                  ancestor.annotation.attributes,
                  slices,
                  (doc) => doc
                ),
              }));
            },
          },
          ...children
        );
      } else {
        return children;
      }
    },
  });
}

function render(props: {
  document: Document;
  includeParseTokens?: boolean;
  slices?: Record<string, Document>;
}) {
  let { document, includeParseTokens, slices } = props;
  let hir = new HIR(document);
  if (slices == null) {
    slices = {};
    let sliceAnnotations = document.annotations.filter(
      (a) => a.type === "slice"
    );
    for (let slice of sliceAnnotations) {
      let docSlice = document.clone();
      docSlice
        .where(
          (a) =>
            !(a.start >= slice.start && a.end <= slice.end) || a.id === slice.id
        )
        .remove();
      slices[slice.id] = docSlice.slice(slice.start, slice.end);
    }
  }
  let rootNode = hir.rootNode;
  return rootNode
    .children({ includeParseTokens: includeParseTokens === true })
    .map((node, index) =>
      renderNode({
        node,
        includeParseTokens: includeParseTokens === true,
        slices,
        key: `${node.id}-${index}`,
        ancestors: [],
      })
    );
}

export default {
  render(props: { document: Document; includeParseTokens?: boolean }) {
    return render(props);
  },
};
