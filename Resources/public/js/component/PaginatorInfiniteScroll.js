const PaginatorInfiniteScroll = class {
    constructor(paginationElement) {
        this.paginationElement = paginationElement
        this.paginationContent = document.querySelector('.paginator-content')
        this.currentPageItem = this.paginationElement.querySelector('.page-item.active')
        this.previousItem = paginationElement.querySelector('.page-item[data-page-number="previous"]')
        this.nextItem = paginationElement.querySelector('.page-item[data-page-number="next"]')
        this.isLoading = false

        this.paginationElement.classList.add('d-none')

        if (this.isLoadable()) {
            this.loadNextPage()
        }

        window.addEventListener('scroll', () => {
            if (this.isLoadable()) {
                this.loadNextPage()
            }
        })
    }

    isLoadable()
    {
        return false === this.isLoading && true === this.isBottomElementInViewport()
    }

    isBottomElementInViewport()
    {
        let rect = this.paginationContent.getBoundingClientRect()

        return (
            rect.left >= 0
                &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
                &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        )
    }

    loadNextPage()
    {
        this.isLoading = true

        let currentPageNumber = this.currentPageItem.getAttribute('data-page-number')

        let nextPageItem = this.paginationElement.querySelector('.page-item[data-page-number="' + String(parseInt(parseInt(currentPageNumber) + 1)) + '"]')

        if (null !== nextPageItem) {
            let loader = document.createElement('div')
            loader.classList.add('text-center')
            loader.innerHTML = '<i class="fa fa-spinner fa-spin fa-fw"></i>'
            this.paginationElement.before(loader)

            let httpRequest = new XMLHttpRequest()
            httpRequest.open('GET', nextPageItem.querySelector('a').getAttribute('href'))
            httpRequest.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
            httpRequest.send()
            httpRequest.onreadystatechange = () => {
                if (
                  httpRequest.readyState === XMLHttpRequest.DONE
                    &&
                  httpRequest.status === 200
                ) {
                    loader.remove()

                    this.changeCurrentItem(nextPageItem)

                    let data = JSON.parse(httpRequest.responseText)

                    let contentHtml = document.createElement('ul')
                    contentHtml.innerHTML = data.html

                    while (contentHtml.children.length > 0) {
                        this.paginationContent.appendChild(contentHtml.children[0]);
                    }

                    this.isLoading = false
                }
            }
        } else {
            // console.log('end') => https://stackoverflow.com/questions/62519338/removeeventlistener-for-scroll-event-in-class?noredirect=1#comment110564432_62519338
        }
    }

    changeCurrentItem(currentPageItem)
    {
        let headLink = document.querySelector('link[rel="canonical"]')

        let lastActiveItem = this.paginationElement.querySelector('.page-item.active')
        lastActiveItem.classList.remove('active')
        let lastActiveItemLink = lastActiveItem.querySelector('a')
        lastActiveItemLink.setAttribute('href', headLink.getAttribute('href'))
        lastActiveItemLink.removeAttribute('tabindex')

        this.currentPageItem = currentPageItem
        this.currentPageItem.classList.add('active')
        let currentPageItemLink = currentPageItem.querySelector('a')

        headLink.setAttribute('href', currentPageItemLink.getAttribute('href'))
        currentPageItemLink.setAttribute('href', '#')
        currentPageItemLink.setAttribute('tabindex', '-1')

        let currentPageNumber = parseInt(this.currentPageItem.getAttribute('data-page-number'))

        this.changePaginationControl('prev', String(parseInt(currentPageNumber - 1)))
        this.changePaginationControl('next', String(parseInt(currentPageNumber + 1)))
    }

    changePaginationControl(prevOrNext, numberPage)
    {
        let item = this.paginationElement.querySelector('.page-item[data-page-number="' + numberPage + '"]')
        let control = 'prev' === prevOrNext ? this.previousItem : this.nextItem
        let controlLink = control.querySelector('a')
        let headLink = document.querySelector('link[rel="' + prevOrNext + '"]')

        if (null === item) {
            control.classList.add('disabled')
            controlLink.setAttribute('href', '#')
            controlLink.setAttribute('tabindex', '-1')

            if (null !== headLink) {
                headLink.remove()
            }
        } else {
            let itemLinkHref = item.querySelector('a').getAttribute('href')

            control.classList.remove('disabled')
            controlLink.setAttribute('href', itemLinkHref)
            controlLink.removeAttribute('tabindex')

            if (null === headLink) {
                let head = document.querySelector('head')
                headLink = document.createElement('link')
                headLink.setAttribute('rel', 'prev')
                headLink.setAttribute('href', itemLinkHref)
                head.appendChild(headLink)
            } else {
                headLink.setAttribute('href', itemLinkHref)
            }
        }
    }
}

export default PaginatorInfiniteScroll
