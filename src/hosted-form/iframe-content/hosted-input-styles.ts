type HostedInputStyles = Partial<Pick<
    CSSStyleDeclaration,
    'backgroundColor' |
    'color' |
    'fontFamily' |
    'fontSize' |
    'fontWeight' |
    'lineHeight'
>>;

export default HostedInputStyles;

export interface HostedInputStylesMap {
    default?: HostedInputStyles;
    error?: HostedInputStyles;
    focus?: HostedInputStyles;
}
