import { Pipe, PipeTransform } from '@angular/core';

// Shows seconds as minutes:seconds, for example 95 => "1:35"
@Pipe({ name: 'time' })
export class TimePipe implements PipeTransform {
  transform(totalSeconds: number): string {
    if (!totalSeconds || totalSeconds < 0 || !isFinite(totalSeconds)) {
      return '0:00';
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return minutes + ':' + String(seconds).padStart(2, '0');
  }
}
