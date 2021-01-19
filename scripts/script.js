class Twitter {
    constructor({listElem}) {
        this.tweets = new Posts();
        this.elements = {
            listElems: document.querySelector(listElem)
        };
    }

    renderPosts() {

    }

    showUserPosts() {

    }

    showLikesPosts() {

    }

    showAllPost() {

    }

    openModal() {

    }
}

class Posts {
    constructor({ posts = [] } = {}) {
        this.posts = posts;
    }

    addPost (tweet) {
        const post = new Post(tweet);
        this.posts.push(post);
    }

    deletePost (id) {

    }

    likePost (id) {

    }
}

class Post {
    constructor(param) {
        this.id = param.id;
        this.username = param.username;
        this.nickname = param.nickname;
        this.postDate = param.postDate;
        this.text = param.text;
        this.img = param.img;
        this.likes = param.likes;
        this.liked = false;
    }

    changeLike() {
        this.liked = !this.liked;
        if (this.liked) this.likes++;
        else this.likes--;
    }
}

const twitter =new Twitter({
    listElem: '.tweet-list'
})


console.log(twitter);