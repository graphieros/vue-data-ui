export class Timer {
    constructor(callback, interval, error, showMs = true, showH = true) {
        this.interval = interval;
        this.elapsed = 0;
        this.isPaused = false;
        let startingTime;
        let pausedTime = 0; 

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
            if (!this.isPaused) {
                startingTime = Date.now();
                this.elapsed = 0;
            } else {
                startingTime = Date.now() - this.elapsed;
            }
            this.isPaused = false;
            this.expected = startingTime + this.interval;
            this.timeout = setTimeout(this.cycle, this.interval);
            callback({
                timestamp: startingTime,
                elapsed: this.elapsed,
                formatted: formatTime(this.elapsed)
            });
        };

        this.stop = () => {
            clearTimeout(this.timeout);
            this.elapsed = 0;
            pausedTime = 0;
            this.isPaused = false;
            callback({
                timestamp:  0,
                elapsed: 0,
                formatted: 0
            });
        };

        this.pause = () => {
            if (this.isPaused) {
                this.isPaused = false;
                startingTime = Date.now() - this.elapsed;
                this.expected = Date.now() + (this.interval - (this.elapsed % this.interval));
                this.timeout = setTimeout(this.cycle, this.expected - Date.now());
            } else {
                clearTimeout(this.timeout);
                pausedTime = Date.now();
                this.elapsed = pausedTime - startingTime;
                this.isPaused = true;
            }
        };

        let drift;

        this.cycle = () => {
            drift = Date.now() - this.expected;
            if (drift > this.interval) {
                // FIXME: auto correct expected interval
                !!error && error();
            }
            this.expected += this.interval;
            this.timeout = setTimeout(this.cycle, this.interval - drift);
            this.elapsed += this.interval;
            callback({
                timestamp: this.expected || 0,
                elapsed: this.elapsed,
                formatted: formatTime(this.elapsed)
            });
        };

        this.lap = () => {
            return {
                elapsed: this.elapsed,
                formatted: formatTime(this.elapsed)
            }
        };

        this.restart = () => {
            this.stop();
            this.start();
        };
    }
}
