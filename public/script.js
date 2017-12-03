$(".commentButton").on("click", function (event) {
    let id = ($(this).attr('id'));
    event.preventDefault();
    var newComment = {
        comment: $(`#comment${id}`).val().trim(),
        author: $(`#author${id}`).val().trim()
    };
    console.log(newComment);

    // Send the POST request.
    $.ajax(`/api/comments/${id}`, {
        type: "POST",
        data: newComment
    }).then(
        function () {
            console.log("added new comment");
            location.reload();
        }
        );
});
