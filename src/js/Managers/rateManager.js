export default class RateManager {
    get MAX_RATE() {
        return 5;
    }

    constructor(rateManagerContainer, valueElemStorage) {
        this.rateManagerContainer = rateManagerContainer;
        this.valueElemStorage = valueElemStorage;
        this.currentRate = +1;
        this.emptyStar = '☆';
        this.fullStar = '★';

        this.initDomStructure();
    }

    initDomStructure() {
        for(let i = 0;  i < this.MAX_RATE; i++) {
            let starElem = document.createElement('button');
            starElem.innerHTML = (this.currentRate > i) ? this.fullStar : this.emptyStar;
            starElem.classList.add(i+1);
            starElem.addEventListener('mouseover', this.onMouseOver.bind(this));
            starElem.addEventListener('mouseleave', this.onMouseLeave.bind(this));
            starElem.addEventListener('click', this.onClick.bind(this));
            this.rateManagerContainer.appendChild(starElem);
        }
    }

    reset(rateToSet = this.currentRate) {
        this.currentRate = rateToSet;
        for(let i = 0;  i < this.MAX_RATE; i++) {
            this.rateManagerContainer.children[i].innerHTML = (this.currentRate > i) ? this.fullStar : this.emptyStar;
        }
    }

    onMouseLeave() {
        this.reset();
    }

    onMouseOver(event) {
        let mouseOverIndex = event.target.classList[0];
        for(let i = 0;  i < this.MAX_RATE; i++) {
            this.rateManagerContainer.children[i].innerHTML = (mouseOverIndex > i) ? this.fullStar : this.emptyStar;
        }
    }

    onClick(event) {
        this.currentRate = event.target.classList[0];
        this.valueElemStorage.value = this.currentRate;
    }
}