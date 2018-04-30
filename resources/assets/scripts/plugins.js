import Siema from 'siema';

if (document.getElementsByClassName('c-carousel').length > 0) {
  	const carousel = new Siema({
		selector: '.c-carousel',
		loop: true,
		perPage: 1,
	});

	const prev = document.querySelector('.c-carousel__prev');
	const next = document.querySelector('.c-carousel__next');

	prev.addEventListener('click', () => carousel.prev());
	next.addEventListener('click', () => carousel.next());
}