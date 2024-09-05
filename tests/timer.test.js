import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Timer } from '../src/timer';

describe('Timer', () => {
    let timer;
    let callback;
    let errorCallback;
    let interval;

    beforeEach(() => {
        vi.useFakeTimers();
        interval = 1000;
        callback = vi.fn();
        errorCallback = vi.fn();
        timer = new Timer(callback, interval, errorCallback, true, true);
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it('should start the timer and call the callback with initial values', () => {
        timer.start();
        expect(callback).toHaveBeenCalledTimes(1);
        const { timestamp, elapsed, formatted } = callback.mock.calls[0][0];
        expect(elapsed).toBe(0);
        expect(formatted).toBe('00:00:00.00');
    });

    it('should stop the timer and reset values', () => {
        timer.start();
        timer.stop();
        expect(callback).toHaveBeenCalledTimes(2);
        const { elapsed, formatted } = callback.mock.calls[1][0];
        expect(elapsed).toBe(0);
        expect(formatted).toBe(0); 
    });

    it('should pause the timer and keep the elapsed time', () => {
        timer.start();
        vi.advanceTimersByTime(500); 
        timer.pause();
        expect(callback).toHaveBeenCalledTimes(1); 
        const pausedElapsed = timer.lap().elapsed;
        expect(pausedElapsed).toBe(500);
        vi.advanceTimersByTime(1000); 
        const stillPausedElapsed = timer.lap().elapsed;
        expect(stillPausedElapsed).toBe(500); 
    });

    it('should resume the timer after pausing', () => {
        timer.start();
        vi.advanceTimersByTime(500);
        timer.pause();
        vi.advanceTimersByTime(1000);
        timer.start();
        const resumedElapsed = timer.lap().elapsed;
        expect(resumedElapsed).toBe(500);
    });

    it('should reset the timer on restart', () => {
        timer.start();
        vi.advanceTimersByTime(500);
        timer.restart();
        expect(callback).toHaveBeenCalledTimes(3);
        const { elapsed, formatted } = callback.mock.calls[2][0];
        expect(elapsed).toBe(0);
        expect(formatted).toBe('00:00:00.00');
    });

    it('should format time correctly when hours and hundredth are shown', () => {
        timer.start();
        vi.advanceTimersByTime(3725000);
        const { formatted } = timer.lap();
        expect(formatted).toBe('01:02:05.00');
    });

    it('should format time correctly when hours are hidden', () => {
        timer = new Timer(callback, interval, errorCallback, true, false);
        timer.start();
        vi.advanceTimersByTime(62000);
        const { formatted } = timer.lap();
        expect(formatted).toBe('01:02.00');
    });

    it('should format time correctly when hundredth are hidden', () => {
        timer = new Timer(callback, interval, errorCallback, false, true);
        timer.start();
        vi.advanceTimersByTime(62000);
        const { formatted } = timer.lap();
        expect(formatted).toBe('00:01:02');
    });
});
