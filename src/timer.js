export class Timer {
    constructor(callback, interval, error, showMs = true, showH = true) {
        this.interval = interval;
        this.elapsed = 0;
        this.isPaused = false;

        const workerCode = `
            let interval;
            let elapsed = 0;
            let paused = false;
            let startTime;
            let tickInterval;

            onmessage = function(e) {
                const { action, data } = e.data;

                switch(action) {
                    case 'start':
                        clearInterval(interval);
                        startTime = Date.now();
                        tickInterval = data.interval;
                        elapsed = 0;
                        paused = false;
                        interval = setInterval(() => {
                            elapsed += tickInterval;
                            postMessage({ elapsed, timestamp: Date.now() });
                        }, tickInterval);
                        break;
                    
                    case 'pause':
                        paused = true;
                        clearInterval(interval);
                        elapsed = Date.now() - startTime;
                        break;

                    case 'resume':
                        if (paused) {
                            startTime = Date.now() - elapsed;
                            interval = setInterval(() => {
                                elapsed += tickInterval;
                                postMessage({ elapsed, timestamp: Date.now() });
                            }, tickInterval);
                        }
                        paused = false;
                        break;

                    case 'stop':
                        clearInterval(interval);
                        elapsed = 0;
                        postMessage({ elapsed });
                        break;

                    case 'reset':
                        elapsed = 0;
                        clearInterval(interval);
                        postMessage({ elapsed });
                        break;

                    case 'lap':
                        postMessage({
                            elapsed,
                            timestamp: Date.now(),
                            action: 'lap'
                        });
                        break;

                    default:
                        break;
                }
            };
        `;

        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        let worker;
        try {
            worker = new Worker(workerUrl);
        } finally {
            URL.revokeObjectURL(workerUrl);
        }
        let disposed = false;
        const lapListeners = new Set();
        const postMessage = (message) => {
            if (!disposed) worker.postMessage(message);
        };
        this.destroy = () => {
            if (disposed) return;
            disposed = true;
            lapListeners.forEach((listener) =>
                worker.removeEventListener('message', listener),
            );
            lapListeners.clear();
            worker.onmessage = null;
            worker.onerror = null;
            worker.terminate();
        };

        function formatTime(milliseconds) {
            let totalSeconds = Math.floor(milliseconds / 1000);
            let hundredths = Math.floor((milliseconds % 1000) / 10);

            let hours = Math.floor(totalSeconds / 3600);
            let minutes = Math.floor((totalSeconds % 3600) / 60);
            let seconds = totalSeconds % 60;

            let formattedTime = '';

            if (showH) {
                formattedTime += String(hours).padStart(2, '0') + ':';
            }

            formattedTime += String(minutes).padStart(2, '0') + ':';
            formattedTime += String(seconds).padStart(2, '0');

            if (showMs) {
                formattedTime += '.' + String(hundredths).padStart(2, '0');
            }

            return formattedTime;
        }

        this.start = () => {
            this.isPaused = false;
            postMessage({
                action: 'start',
                data: { interval: this.interval },
            });
        };

        this.pause = () => {
            if (this.isPaused) {
                this.resume();
            } else {
                this.isPaused = true;
                postMessage({ action: 'pause' });
            }
        };

        this.resume = () => {
            if (this.isPaused) {
                postMessage({ action: 'resume' });
                this.isPaused = false;
            }
        };

        this.stop = () => {
            postMessage({ action: 'stop' });
            this.isPaused = false;
        };

        this.reset = () => {
            postMessage({ action: 'reset' });
            this.elapsed = 0;
            this.isPaused = false;
        };

        this.restart = () => {
            this.stop();
            this.start();
        };

        this.lap = () => {
            return new Promise((resolve) => {
                postMessage({ action: 'lap' });
                const handleLap = (event) => {
                    lapListeners.delete(handleLap);
                    if (disposed) return;
                    const { elapsed, timestamp, action } = event.data;
                    if (action === 'lap') {
                        const formattedTime = formatTime(elapsed);
                        const lapData = {
                            timestamp: timestamp || 0,
                            elapsed: elapsed,
                            formatted: formattedTime,
                        };
                        resolve(lapData);
                    }
                };
                if (disposed) return;
                lapListeners.add(handleLap);
                worker.addEventListener('message', handleLap, { once: true });
            });
        };

        worker.onmessage = (event) => {
            if (disposed) return;
            const { elapsed, timestamp } = event.data;
            this.elapsed = elapsed;
            callback({
                timestamp: timestamp || 0,
                elapsed: this.elapsed,
                formatted: formatTime(this.elapsed),
            });
        };

        worker.onerror = (e) => {
            if (disposed) return;
            !!error && error(e);
        };
    }
}
