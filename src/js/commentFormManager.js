import RateManager from './rateManager'; 
export default class CommentFormManager {
    constructor(restaurant, containerElement, db) {
        this.db = db;
        this.restaurant = restaurant;
        this.containerElement = containerElement;
        this.rateManager = null;
        this.formElem = {
            headerText: null,
            rateHidden: null,
            rateManagerContainer: null,
            authorInputText: null,
            commentTextarea: null,
            submitBtn: null
        };

        this.render();
    }
    render() {
        this.formElem.headerText = document.createElement('h3');
        this.formElem.headerText.innerHTML = "Add new review";

        this.formElem.rateHidden = document.createElement('input');
        this.formElem.rateHidden.id = 'review-form-rete-hidden';
        this.formElem.rateHidden.setAttribute('type','hidden');
        this.formElem.rateHidden.value = 0;

        this.formElem.rateManagerContainer = document.createElement('div');
        this.formElem.rateManagerContainer.classList.add('review-form-rate-manager');
        this.containerElement.appendChild(this.formElem.rateManagerContainer);
        this.rateManager = new RateManager(this.formElem.rateManagerContainer, this.formElem.rateHidden);  
                
        this.formElem.authorInputText = document.createElement('input'); 
        this.formElem.authorInputText.id = 'review-form-author-input-text';
        this.formElem.authorInputText.classList.add('review-form-input-text');
        this.formElem.authorInputText.placeholder = 'Put your name here ...';
        this.formElem.authorInputText.setAttribute('maxlength', 30);
        
        this.formElem.commentTextarea = document.createElement('textarea');
        this.formElem.commentTextarea.id = 'review-form-comment-textarea';
        this.formElem.commentTextarea.classList.add('review-form-textarea');
        this.formElem.commentTextarea.placeholder = 'Put your comment here ...';
        this.formElem.commentTextarea.setAttribute('maxlength', 500);

        this.formElem.submitBtn = document.createElement('button');
        this.formElem.submitBtn.id = 'review-form-submit-btn';
        this.formElem.submitBtn.classList.add('review-form-submit');
        this.formElem.submitBtn.addEventListener('click', this.onSubmit.bind(this));
        
        // create each form element
        for(let formElemKey in this.formElem)
        {
            this.containerElement.appendChild(this.formElem[formElemKey]);  
        }
    }

    onSubmit() {
        console.log('form submited...',this);
        //this.db.updateRestaurantById(this.restaurant, ...)
    }
}