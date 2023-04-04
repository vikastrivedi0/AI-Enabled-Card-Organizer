//show image on html, access image with event.target.files[0]
var loadFile = function (event) {
    var image = document.getElementById('imageOutput');
    image.src = URL.createObjectURL(event.target.files[0]);
};