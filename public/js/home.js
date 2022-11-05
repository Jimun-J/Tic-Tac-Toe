$('.toggle').click((e) => {
    $('.toggle').removeClass('active');
    $(e.target).addClass('active');
})

$('.buttons button').click((e) => {
    $.ajax('/game-mode', {
        type: 'POST',
        data: {
            marker: $('.active').html(),
            gameMode: e.target.classList.value,
        },
        success: (data) => {
            if (data.gameMode === 'vs-cpu') {
                window.location.href = `/${e.target.classList.value}`;
            } else if (data.gameMode === 'vs-player') {
                window.location.href = `/${e.target.classList.value}/${data.roomId}`;
            } else {
                $('.background-modal').css("display", "block");
            }
        }
    });
});

$('.back-to-home').click(() => {
    $('.background-modal').css("display", "none");
})

$('.join').click(() => {
    $.ajax('/join', {
        type: 'POST',
        data: {
            roomId: $("input[name=roomId]").val()
        },
        success: (data) => {
            if (data.roomExist && !data.roomFull) {
                window.location.href = `/vs-player/${$("input[name=roomId]").val()}`;
            } else if (data.roomExist && data.roomFull) {
                $('.warning').text('Room is already full');
            } else {
                $('.warning').text('Room does not exist');
            }
        }
    })
})