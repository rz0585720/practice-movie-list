const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
const filterMovieList = []
const MOVIE_PER_PAGE = 12
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const changeMode = document.querySelector('#change-mode')
let currentPage = 1

// 畫面渲染
function renderMovieList (data) {
  if (dataPanel.dataset.mode === 'card-mode') {
    let rawHTML = ''
    data.forEach((item) => {
      rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${
          POSTER_URL + item.image
        }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${
            item.id
          }">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
    })
    dataPanel.innerHTML = rawHTML
  } else if (dataPanel.dataset.mode === 'list-mode') {
    let rawHTML = '<ul class="list-group col-sm-12 mb-2">'
    data.forEach((item) => {
      rawHTML += `<li class="list-group-item d-flex justify-content-between">
      <h5 class="card-title">${item.title}</h5>
      <div>
        <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal"
          data-id="${item.id}">More</button>
        <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
      </div>
    </li>`
    })
    rawHTML += '</ul>'
    dataPanel.innerHTML = rawHTML
  }
}

// 切換顯示模式
function changeDisplayMode (mode) {
  if (dataPanel.dataset.mode === mode) return
  dataPanel.dataset.mode = mode
}

// 渲染分頁器
function renderPaginator (amount) {
  const numberOfPages = Math.ceil(amount / MOVIE_PER_PAGE)
  let rawHTML = ''
  for (let i = 1; i <= numberOfPages; i++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

// 取得每頁該顯示的資料
function getMoviesByPage (page) {
  const startIndex = (page - 1) * MOVIE_PER_PAGE
  const data = filterMovieList.length ? filterMovieList : movies // 如果filterMovieList裡有東西則回傳filterMovieList否則回傳movies
  return data.slice(startIndex, startIndex + MOVIE_PER_PAGE)
}

// 電影介紹視窗
function showMovieModal (id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results
      modalTitle.textContent = data.title
      modalDate.textContent = 'Release date: ' + data.release_date
      modalDescription.textContent = data.description
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    })
    .catch((err) => console.log(err))
}

// 加入收藏清單
function addToFavorite (id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)

  if (list.some((movie) => movie.id === id)) {
    return alert('This movie is already in your favorite list')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// 監聽切換顯示模式事件
changeMode.addEventListener('click', function onModeClicked (event) {
  if (event.target.matches('#card-mode-btn')) {
    changeDisplayMode('card-mode')
    renderMovieList(getMoviesByPage(currentPage))
  } else if (event.target.matches('#list-mode-btn')) {
    changeDisplayMode('list-mode')
    renderMovieList(getMoviesByPage(currentPage))
  }
})

// 監聽dataPanel
dataPanel.addEventListener('click', function onPanelClicked (event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 監聽分頁
paginator.addEventListener('click', function onPaginatorClicked (event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  currentPage = page // currentPage儲存現在點擊頁數
  renderMovieList(getMoviesByPage(currentPage))
})

// 監聽搜尋欄位
searchForm.addEventListener('submit', function onSearchFormSubmit (event) {
  event.preventDefault() // 避免瀏覽器預設行為
  const keyword = searchInput.value.trim().toLowerCase()

  // filter用法會回傳新的陣列，其條件為return後方為true的物件(這邊因為filterMovieList用const宣告，所以使用forEach迴圈再push進去)
  // filterMovieList = movies.filter((item) => item.title.toLowerCase().includes(keyword))
  movies.forEach((item) => {
    if (item.title.toLowerCase().includes(keyword)) {
      filterMovieList.push(item)
    }
  })

  if (filterMovieList.length === 0) {
    return alert('Cannot find movies with keyword: ' + keyword)
  }
  renderPaginator(filterMovieList.length) // 搜尋過後重置分頁器
  renderMovieList(getMoviesByPage(currentPage))
})

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length) // 產生正確頁數
    renderMovieList(getMoviesByPage(currentPage)) // 一開始只產生第一頁資料
  })
  .catch((err) => console.log(err))
