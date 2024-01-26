export class IntervalUpdater {
  private updater: (...args: any[]) => Promise<any>;
  private interval: number;
  private intervalId?: NodeJS.Timeout;

  constructor(updater: (...args: any[]) => Promise<any>, interval: number) {
    this.updater = updater;
    this.interval = interval;
  }

  update = async () => {
    this.stop();
    return this.updater().finally(this.run);
  };

  run = (immediately = false) => {
    if (immediately) {
      this.update();
    } else {
      this.intervalId = setTimeout(this.update, this.interval);
    }
  };

  stop = () => {
    clearTimeout(this.intervalId);
  };

  reset = () => {
    this.stop();
    this.run();
  };
}
