import { StyleSheet } from 'aphrodite';

export default StyleSheet.create({
  default: {
    // '--primary-color': '#f14748',
    '--primary-color': '#03a1ec',
    '--default-text-color': '#333',
    '--lighter-text-color': '#555',
    '--light-text-color': '#777',

    '--bar-color': '#efefef',
    '--bar-border-color': '#dadada',
    '--bar-active-button-bg': 'rgba(0, 0, 0, 0.07)',

    '--content-border-color': 'var(--bar-border-color)',
    '--split-dragger-color': 'rgba(0, 0, 0, 0.35)',

    '--treenode-bracket': '#777',
    '--treenode-tag-name': 'var(--primary-color)',
    '--treenode-arrow': '#666',
    '--treenode-props': '#666',
    '--treenode-props-key': 'inherit',
    '--treenode-props-ellipsis': 'inherit',
    '--treenode-props-value': '#555',
    '--treenode-props-value-prop-number': 'var(--treenode-props-value)',
    '--treenode-props-value-prop-string': 'var(--treenode-props-value)',
    '--treenode-props-value-prop-nonobject': 'var(--treenode-props-value)',
    '--treenode-props-value-prop-fn': 'var(--treenode-props-value)',
    '--treenode-props-value-prop-iterator': 'var(--treenode-props-value)',
    '--treenode-props-value-prop-symbol': 'var(--treenode-props-value)',
    '--treenode-props-value-prop-nested': 'var(--treenode-props-value)',
    '--treenode-props-value-array': 'var(--treenode-props-value)',
    '--treenode-props-value-object': 'var(--treenode-props-value)',
    '--treenode-props-value-object-attr': 'var(--treenode-props-value)',
    '--treenode-hovered-bg': 'rgba(0, 0, 0, 0.05)',
    '--treenode-selected-bg': 'var(--primary-color)',
    '--treenode-hover-guide': 'rgba(0, 0, 0, 0.1)',
    '--treenode-search-highlight': 'rgba(255, 255, 0, 0.5)',

    '--dataview-preview-key': '#881391',
    '--dataview-preview-value': 'var(--default-text-color)',
    '--dataview-preview-value-empty': 'var(--light-text-color)',
    '--dataview-preview-value-primitive': '#1c00cf',
    '--dataview-preview-value-primitive-string': '#c41a16',
    '--dataview-preview-value-primitive-undefined': '#777',
    '--dataview-preview-value-complex': '#616161',
    '--dataview-preview-value-missing': 'var(--light-text-color)',
    '--dataview-preview-punctuation': '#323232',
    '--dataview-arrow': '#6e6e6e',

    '--font-family-monospace': '"Hack", "SF Mono", "Menlo", "Monaco", monospace',
  },
});
