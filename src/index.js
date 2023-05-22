import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import NewApiImages from './JS/NewApiImages';
import LoadMoreBtn from './JS/components/LoadMoreBtn';
import createMarcup from './JS/createMarcup';

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
};

const newApiImage = new NewApiImages();
const loadMoreBtn = new LoadMoreBtn({
  selector: '.load-more',
  isHidden: true,
});

refs.form.addEventListener('submit', onSubmitSearch);
loadMoreBtn.button.addEventListener('click', onLoadMore);
refs.gallery.addEventListener('click', onClickOpenLightbox);

function onSubmitSearch(event) {
  event.preventDefault();

  newApiImage.searchQuery = event.currentTarget.elements.searchQuery.value;
  newApiImage.resetPage();
  newApiImage
    .fetchImages()
    .then(({ hits, totalHits }) => {
      console.log(hits);
      console.log(newApiImage.searchQuery);
      if (hits.length === 0 || newApiImage.searchQuery === '') {
        console.log('Error 1');
        clearPage();
        loadMoreBtn.hide();
        throw new Error();
      } else {
        Notiflix.Notify.success(`"Hooray! We found ${totalHits} images."`);
        console.log(hits);
        return hits;
      }
    })
    .then(hits => {
      clearPage();

      createImagesOnPage(hits);
      if (hits.length < newApiImage.per_page) {
        loadMoreBtn.hide();
      } else {
        loadMoreBtn.show();
      }
    })
    .catch(error => {
      console.log(error);
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    })
    .finally(() => refs.form.reset());
}

function createImagesOnPage(images) {
  createMarcup(images);
  refs.gallery.insertAdjacentHTML('beforeend', marcup);
}

function onLoadMore() {
  loadMoreBtn.disable();
  newApiImage
    .fetchImages()
    .then(({ hits }) => {
      console.log(hits);
      if (hits.length === 0) {
        loadMoreBtn.hide();
        console.log('Error 2');
        throw new Error();
      }
      return hits;
    })
    .then(hits => {
      console.log(hits);
      createImagesOnPage(hits);
      smoothScroll();
    })
    .then(() => loadMoreBtn.enable())
    .catch(error => {
      console.log(error);
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    });
}

function clearPage() {
  refs.gallery.innerHTML = '';
}

function onClickOpenLightbox(e) {
  e.preventDefault();
  if (e.target.nodeName !== 'IMG') {
    return;
  }
  const options = {
    captionsData: 'alt',
    captionDelay: 250,
  };
  new SimpleLightbox('.gallery__item', options);
}

function smoothScroll() {
  const { height: cardHeight } =
    refs.gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function handleScroll() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight - 5) {
    onLoadMore();
    loadMoreBtn.hide();
  }
}

window.addEventListener('scroll', handleScroll);
