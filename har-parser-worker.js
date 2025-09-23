function parseHar(harText) {
    try {
        const harData = JSON.parse(harText);

        // JS, CSS, Image, Video, Font 등의 content를 버리기
        const contentTypesToDiscard = [
            'text/javascript',
            'application/javascript',
            'text/css',
            'image/',
            'video/',
            'audio/',
            'font/',
            'application/font-',
            'application/vnd.ms-fontobject',
            'application/x-font-ttf',
            'application/x-font-otf',
            'application/x-font-woff',
            'application/font-woff2'
        ];

        harData.log.entries.forEach(entry => {
            if (entry.response.content) {
                const contentType = entry.response.headers.find(h =>
                    h.name.toLowerCase() === 'content-type'
                );
                if (contentType) {
                    const type = contentType.value.toLowerCase();
                    if (contentTypesToDiscard.some(discardType => type.includes(discardType))) {
                        entry.response.content.text = null;
                        entry.response.content.encoding = null;
                    }
                }
            }
        });

        // availableMethods 계산
        const methods = new Set();
        harData.log.entries.forEach(entry => {
            methods.add(entry.request.method);
        });
        const availableMethods = Array.from(methods).sort();

        // availableHeaders 계산
        const headers = new Set();
        harData.log.entries.forEach(entry => {
            entry.request.headers.forEach(header => {
                headers.add(header.name);
            });
            entry.response.headers.forEach(header => {
                headers.add(header.name);
            });
        });
        const availableHeaders = Array.from(headers).sort();

        return { success: true, harData, availableMethods, availableHeaders };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

if (typeof window === 'undefined') {
    // Web Worker 환경
    self.onmessage = function(e) {
        const { harText } = e.data;
        const result = parseHar(harText);
        self.postMessage(result);
    };
}
