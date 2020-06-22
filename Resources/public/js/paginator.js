import PaginatorInfiniteScroll from './component/PaginatorInfiniteScroll'

let pagination = document.querySelector('.pagination')

if (null !== pagination) {
    new PaginatorInfiniteScroll(pagination)
}