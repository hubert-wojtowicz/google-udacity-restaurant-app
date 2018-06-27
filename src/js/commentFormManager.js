export default class CommentFormManager {
    constructor(restaurant, containerElement, db) {
        this.db = db;
        this.restaurant = restaurant;
        this.containerElement = containerElement;
        this.formDef = {
            headerText: null,
            authorInputText: null,
            commentTextarea: null,
            rateHidden: null,
            submitBtn: null
        };

        this.emptyStar = '☆';
        this.fullStar = '★';

        this.render();
    }
    render() {
        this.formDef.headerText = document.createElement('h3');
        this.formDef.headerText.innerHTML = "Add new review";

        this.formDef.authorInputText = document.createElement('input'); 
        this.formDef.authorInputText.classList.add('review-form-input-text');

        this.formDef.commentTextarea = document.createElement('textarea');
        this.formDef.commentTextarea.classList.add('review-form-textarea');
        
        this.formDef.rateHidden = document.createElement('input');
        this.formDef.rateHidden.setAttribute('type','hidden');

        this.formDef.submitBtn = document.createElement('button');
        this.formDef.submitBtn.classList.add('review-form-submit');
        this.formDef.submitBtn.addEventListener('click', this.onSubmit.bind(this));
        
        // create each form element
        for(let formElemKey in this.formDef)
        {
            this.containerElement.appendChild(this.formDef[formElemKey]);  
        }
    }

    onSubmit() {
        console.log('form submited...',this);
        //this.db.updateRestaurantById(this.restaurant, ...)
    }
}