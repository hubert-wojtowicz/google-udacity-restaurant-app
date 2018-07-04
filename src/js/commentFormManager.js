import RateManager from './rateManager'; 

export default class CommentFormManager {
    constructor(restaurant, containerElement, db) {
        this.db = db;
        this.restaurant = restaurant;
        this.containerElement = containerElement;
        this.rateManager = null;
        this.formElem = {
            headerText: null,
            validationBoxText: null,
            rateHidden: null,
            rateManagerContainer: null,
            authorInputText: null,
            commentTextarea: null,
            submitBtn: null
        };

        this._render();
    }
    _render() {
        this.formElem.headerText = document.createElement('h3');
        this.formElem.headerText.innerHTML = 'Add new review';

        this.formElem.validationBoxText = document.createElement('div');
        this.formElem.validationBoxText.classList.add('review-form-validation-box', 'none');

        this.formElem.rateHidden = document.createElement('input');
        this.formElem.rateHidden.id = 'review-form-rete-hidden';
        this.formElem.rateHidden.setAttribute('type','hidden');
        this.formElem.rateHidden.value = 1;

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
        this.formElem.submitBtn.addEventListener('click', this._onSubmit.bind(this));
        
        // create each form element
        for(let formElemKey in this.formElem)
        {
            this.containerElement.appendChild(this.formElem[formElemKey]);  
        }
    }

    _validate() {
        let msg = new Array();
        
        const minAuthorNameLength = 3;
        if(!this.formElem.authorInputText.value || 
            this.formElem.authorInputText.value.length < minAuthorNameLength)
            msg.push(`There should be author name longer than ${minAuthorNameLength} characters.`);

        const minCommentTextLength = 10;
        if(!this.formElem.commentTextarea.value || 
            this.formElem.commentTextarea.value.length < minCommentTextLength)   
            msg.push(`There should be comment at least ${minCommentTextLength} characters lenght.`);

        return msg;
    }

    _onSubmit() {
        const validationMsg = this._validate();
        this._addValidationMsg(validationMsg);
        
        const newReview = {
            'restaurant_id': this.restaurant.id,
            'name': this.formElem.authorInputText.value,
            'rating': this.formElem.rateHidden.value,
            'comments': this.formElem.commentTextarea.value
          };

        this.db.addRestaurantReview(newReview)
        .then((review) => {
            // adding review to current form
            //this.addRevievCallback(review);
        }).catch(err => console.log(err));
        
        if(validationMsg.length == 0) {
            this._showSuccessMsg();  
            this._resetForm();
        }
    }
    
    _addValidationMsg(validationMsg) {
        if(validationMsg.length > 0) {
            this._enableValidation();
            this.formElem.validationBoxText.classList.add('invalid');
            this.formElem.validationBoxText.innerHTML = validationMsg.join('</br>');   
        }
    }

    _showSuccessMsg() {
        this._enableValidation();
        this.formElem.validationBoxText.classList.add('valid');
        this.formElem.validationBoxText.innerHTML = 'The form has been submited successfully!';
        let f = this._cleanValidation;
        setInterval(function() {
            this._cleanValidation();
        }.bind(this),1500);
    }

    _enableValidation() {
        this.formElem.validationBoxText.classList.remove('none');
    }

    _cleanValidation() {
        this.formElem.validationBoxText.classList.remove('valid', 'invalid'); 
        this.formElem.validationBoxText.classList.add('none'); 
        this.formElem.validationBoxText.innerHTML = '';
    }

    _resetForm() {
        this.rateManager.reset(1);
        this.formElem.rateHidden.value = 1;
        this.formElem.authorInputText.value = "";
        this.formElem.commentTextarea.value = "";
    }
}