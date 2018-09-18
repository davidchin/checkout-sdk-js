import 'iframe-resizer/js/iframeResizer.contentWindow';

window.addEventListener('message', event => {
    if (event.data && event.data.type === 'IS_LOADED') {
        if (event.origin !== 'http://localhost:8081') {
            return;
        }

        if (event.source && event.data.type === 'IS_LOADED') {
            event.source.postMessage({ type: 'LOADED' }, event.origin);
        }
    }
});
