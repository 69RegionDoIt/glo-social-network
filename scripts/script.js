class FetchData {
    getResource = async url => {
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error('Произошла ошибка: ' + res.status);
        }

        return res.json();
    }

    getPost = () => this.getResource('./db/database.json');
}

class Twitter {
    constructor({
                    user,
                    listElem,
                    modalElems,
                    tweetElems,
                    classDeleteTweet,
                    classLikeTweet,
                    sortElem,
                    showUserPostElem,
                    showLikedPostElem
                }) {
        const fetchData = new FetchData();
        this.user = user;
        this.tweets = new Posts();

        this.elements = {
            listElems: document.querySelector(listElem),
            sortElem: document.querySelector(sortElem),
            modal: modalElems,
            tweet: tweetElems,
            showUserPostElem: document.querySelector(showUserPostElem),
            showLikedPostElem: document.querySelector(showLikedPostElem),
        };

        this.class = {
            classDeleteTweet,
            classLikeTweet
        };

        this.sortData = true;

        fetchData.getPost()
            .then(data => {
                data.forEach(item => this.tweets.addPost(item));
                this.showAllPost();
            });

        this.elements.modal.forEach(this.handlerModal, this);
        this.elements.tweet.forEach(this.addTweet, this);

        this.elements.listElems.addEventListener('click', this.handlerTweet);
        this.elements.sortElem.addEventListener('click', this.changeSort);

        this.elements.showLikedPostElem.addEventListener('click', this.showLikesPosts);
        this.elements.showUserPostElem.addEventListener('click', this.showUserPosts);
    }

    renderPosts(posts) {
        this.elements.listElems.textContent = '';
        const sortPosts = posts.sort(this.sortFields());

        sortPosts.forEach(({id, username, nickname, text, img, likes, getDate, liked}) => {
            this.elements.listElems.insertAdjacentHTML('beforeend', `
            <li>
                <article class="tweet">
                    <div class="row">
                        <img class="avatar" src="images/${nickname}.jpg" alt="Аватар пользователя ${nickname}">
                            <div class="tweet__wrapper">
                                <header class="tweet__header">
                                    <h3 class="tweet-author">${username}
                                        <span class="tweet-author__add tweet-author__nickname">@${nickname}</span>
                                        <time class="tweet-author__add tweet__date">${getDate()}</time>
                                    </h3>
                                    <button class="tweet__delete-button chest-icon" data-id="${id}"></button>
                                </header>
                                <div class="tweet-post">
                                    <p class="tweet-post__text">${text}</p>
                                    ${img ?
                `<figure class="tweet-post__image">
                                    <img src="${img}" alt="Иллюстрация поста ${nickname}">
                                    </figure>` : ``}
                                </div>
                            </div>
                    </div>
                    <footer>
                        <button class="tweet__like ${liked ? this.class.classLikeTweet.active : ''}" data-id=${id}>
                            ${likes}
                        </button>
                    </footer>
                </article>
        </li>`);
        });
    }

    showUserPosts = () => {
        const posts = this.tweets.posts.filter(item => item.nickname === this.user.nick);
        this.renderPosts(posts)
    }

    showLikesPosts = () => {
        const posts = this.tweets.posts.filter(item => item.liked);
        this.renderPosts(posts);
    }

    showAllPost() {
        this.renderPosts(this.tweets.posts);
    }

    handlerModal({button, modal, overlay, close}) {
        const buttonElem = document.querySelector(button);
        const modalElem = document.querySelector(modal);
        const overlayElem = document.querySelector(overlay);
        const closeElem = document.querySelector(close);

        const openModal = () => {
            modalElem.style.display = 'block';
        }

        const closeModal = (elem, event) => {
            const target = event.target;
            if (target === elem) {
                modalElem.style.display = 'none';
            }
        }

        buttonElem.addEventListener('click', openModal);

        if (closeElem) closeElem.addEventListener('click', closeModal.bind(null, closeElem));
        if (overlayElem) overlayElem.addEventListener('click', closeModal.bind(null, overlayElem));

        this.handlerModal.closeModal = () => {
            modalElem.style.display = 'none';
        };
    }

    addTweet({text, img, submit}) {
        const textElem = document.querySelector(text);
        const imgElem = document.querySelector(img);
        const submitElem = document.querySelector(submit);

        let imgUrl = '';
        let tempString = textElem.innerHTML;

        if (submitElem) submitElem.addEventListener('click', () => {
            this.tweets.addPost({
                userName: this.user.name,
                nickname: this.user.nick,
                text: textElem.innerHTML,
                img: imgUrl
            });
            this.showAllPost();
            this.handlerModal.closeModal();
            textElem.innerHTML = tempString;
        });

        textElem.addEventListener('click', () => {
            if (textElem.innerHTML === tempString) textElem.innerHTML = '';
        });

        imgElem.addEventListener('click', () => {
            imgUrl = prompt('Введите адрес картинки...');
        });
    }

    handlerTweet = (event) => {
        const target = event.target;
        if (target.classList.contains(this.class.classDeleteTweet)) {
            this.tweets.deletePost(target.dataset.id);
            this.showAllPost();
        }

        if (target.classList.contains(this.class.classLikeTweet.like)) {
            this.tweets.likePost(target.dataset.id);
            this.showAllPost();
        }
    }

    changeSort = () => {
        this.sortData = !this.sortData;
        this.showAllPost();
    }

    sortFields() {
        if (this.sortData) {
            return (a, b) => {
                const dateA = new Date(a.postDate);
                const dateB = new Date(b.postDate);
                return dateB - dateA;
            }
        } else {
            return (a, b) => b.likes - a.likes;
        }
    }
}

class Posts {
    constructor({posts = []} = {}) {
        this.posts = posts;
    }

    addPost(tweet) {
        this.posts.push(new Post(tweet));
    }

    deletePost(id) {
        this.posts = this.posts.filter(item => item.id !== id);
    }

    likePost(id) {
        this.posts.forEach(item => {
            if (item.id === id) {
                item.changeLike();
            }
        });
    }
}

class Post {
    constructor({id, userName, nickname, postDate, text, img, likes = 0}) {
        this.id = id || this.generateID();
        this.username = userName;
        this.nickname = nickname;
        this.postDate = postDate ? this.correctDate(postDate) : new Date();
        this.text = text;
        this.img = img;
        this.likes = likes;
        this.liked = false;
    }

    changeLike() {
        this.liked = !this.liked;
        if (this.liked) this.likes++;
        else this.likes--;
    }

    generateID() {
        return (Math.random().toString(32).substring(2, 9) + (+new Date).toString(32))
    }

    getDate = () => {
        const options = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };

        return this.postDate.toLocaleString('ru-RU', options);
    }

    correctDate(date) {
        if (isNaN(Date.parse(date))) date = date.replace(/\./g, '/');
        return new Date(date);
    }
}

const twitter = new Twitter({
    listElem: '.tweet-list',
    user: {
        name: 'Nikita',
        nick: 'gnikitos'
    },
    modalElems: [
        {
            button: '.header__link_tweet',
            modal: '.modal',
            overlay: '.overlay',
            close: '.modal-close__btn'
        }
    ],
    tweetElems: [
        {
            text: '.modal .tweet-form__text',
            img: '.modal .tweet-img__btn',
            submit: '.modal .tweet-form__btn',
        },
        {
            text: '.tweet-form__text',
            img: '.tweet-img__btn',
            submit: '.tweet-form__btn',
        }
    ],
    classDeleteTweet: 'tweet__delete-button',
    classLikeTweet: {
        like: 'tweet__like',
        active: 'tweet__like_active'
    },
    sortElem: '.header__link_sort',
    showUserPostElem: '.header__link_profile',
    showLikedPostElem: '.header__link_likes'
});