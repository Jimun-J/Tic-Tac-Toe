$('.toggle').click((e) => {
    $('.toggle').removeClass('active');
    $(e.target).addClass('active');
})

$('button').click((e) => {
    $.ajax('/game-mode', {
        type: 'POST',
        data: {
            marker: $('.active').html(),
            gameMode: e.target.classList.value,
        },
        success: () => {
            window.location.href = `/${e.target.classList.value}`;
        }
    });
});