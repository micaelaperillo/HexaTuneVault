import type { PageRequest } from '../model/page.model';

export class PageDto<T> {
  readonly items: T[];
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;

  private constructor(
    items: T[],
    page: number,
    pageSize: number,
    total: number,
  ) {
    this.items = items;
    this.page = page;
    this.pageSize = pageSize;
    this.total = total;
  }

  static of<T>(items: T[], req: PageRequest, total: number): PageDto<T> {
    return new PageDto<T>(items, req.page, req.pageSize, total);
  }
}
