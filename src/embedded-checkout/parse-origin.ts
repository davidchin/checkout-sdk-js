export default function parseOrigin(url: string): string {
    // new URL() is not supported in IE11, use anchor tag instead
    const anchor = document.createElement('a');

    anchor.href = url;

    return `${anchor.protocol}//${anchor.hostname}`;
}
