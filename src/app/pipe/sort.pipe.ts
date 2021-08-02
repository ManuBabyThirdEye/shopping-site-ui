import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortBy'
})
export class SortPipe implements PipeTransform {

  transform(array: any, field: string, sortorder : number = 1): any[] {
    if (!Array.isArray(array)) {
      return;
    }
    array.sort((a: any, b: any) => {
      if (a[field] < b[field]) {
        return -1*sortorder;
      } else if (a[field] > b[field]) {
        return 1*sortorder;
      } else {
        return 0;
      }
    });
    console.log("sorted");
    console.log(array);

    return array;
  }

}
