const periodTypes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
// const colorMappings = {
//     A: 1,
//     B: 2,
//     C: 3,
//     D: 4,
//     E: 5,
//     F: 6,
//     G: 7,
//     WIN: 8,
//     Advisory: 9,
//     Lion: 10,
// };

const dummyCard = document.querySelector('.dummy.class-card');
const cardsContainer = document.querySelector('.class-cards');

periodTypes.forEach((periodName) => {
    // Generate card
    const card = dummyCard.cloneNode(true);

    cardsContainer.insertBefore(card, document.querySelector('.Advisory'));
    card.classList.remove('dummy');

    if (!['C', 'D', 'F', 'G'].includes(periodName)) {
        card.querySelector('.lunchfield').remove();
    }

    let blockPages = [];
    const blockTabs = [
        card.querySelector('.block-tab-1'),
        card.querySelector('.block-tab-2'),
        card.querySelector('.block-tab-3'),
    ];
    // let settingsCache = [
    //     {
    //         hasClass: true,
    //         lunch: 3,
    //         class: '',
    //         teacher: '',
    //         room: '',
    //         color: colorMappings[periodName],
    //         customColor: '#ff0000',
    //     },
    //     {
    //         hasClass: true,
    //         lunch: 3,
    //         class: '',
    //         teacher: '',
    //         room: '',
    //         color: colorMappings[periodName],
    //         customColor: '#ff0000',
    //     },
    //     {
    //         hasClass: true,
    //         lunch: 3,
    //         class: '',
    //         teacher: '',
    //         room: '',
    //         color: colorMappings[periodName],
    //         customColor: '#ff0000',
    //     },
    // ];

    let settingsCache = [];
    for (let i = 0; i < 3; i += 1) {
        settingsCache.push(
            JSON.parse(JSON.stringify(BlockSettings[`${periodName}${i + 1}`])),
        );
    }

    let differentBlocks = !(
        areBlockSettingsSame(settingsCache[0], settingsCache[1]) &&
        areBlockSettingsSame(settingsCache[1], settingsCache[2])
    );
    let blockPage = 0;

    // Create new pages
    const originalBlockPage = card.querySelector('.block-page');
    for (let i = 0; i < blockTabs.length; i += 1) {
        blockPages.push(originalBlockPage.cloneNode(true));
        blockPages[i].classList.add(`block-page-${i + 1}`);
        blockTabs[i].querySelector('a').innerHTML = `${periodName}${i + 1}`;
    }
    originalBlockPage.remove();
    card.querySelector('.card-content').append(...blockPages);

    // Change names
    card.querySelector('.card-header-title').innerHTML = periodName;

    card.querySelector('.differentBlocks-name').innerHTML = periodName;

    // Open/close
    card.querySelector('.card-header').addEventListener('click', () => {
        card.classList.toggle('is-closed');
    });

    const updateBlockTabs = () => {
        if (differentBlocks) {
            card.querySelector('.block-tabs').style.display = 'block';
        } else {
            card.querySelector('.block-tabs').style.display = 'none';
        }

        for (let i = 0; i < blockTabs.length; i += 1) {
            if (i === blockPage) {
                blockTabs[i].classList.add('is-active');
                blockPages[i].style.display = 'block';
            } else {
                blockTabs[i].classList.remove('is-active');
                blockPages[i].style.display = 'none';
            }
        }
    };

    card.querySelector('.differentBlocks').addEventListener('change', () => {
        differentBlocks = !card.querySelector('.differentBlocks').checked;
        blockPage = 0;
        updateBlockTabs();
    });

    const write = () => {
        if (!differentBlocks) {
            // Copy settings pages
            settingsCache[1] = Object.assign({}, settingsCache[0]);
            settingsCache[2] = Object.assign({}, settingsCache[0]);
        }
        BlockSettings[`${periodName}1`] = settingsCache[0];
        BlockSettings[`${periodName}2`] = settingsCache[1];
        BlockSettings[`${periodName}3`] = settingsCache[2];

        draw();
        saveData();
        writeback();
    };

    let writebackListenerLock = false;

    const writeback = () => {
        for (let i = 0; i < blockTabs.length; i += 1) {
            writebackListenerLock = true;
            blockPages[i].querySelector('.hasClass').checked =
                settingsCache[i].hasClass;

            if (settingsCache[i].hasClass) {
                blockPages[i].querySelector(
                    '.class-info-fields',
                ).style.display = 'block';
            } else {
                blockPages[i].querySelector(
                    '.class-info-fields',
                ).style.display = 'none';
            }

            blockPages[i].querySelector('.class').value =
                settingsCache[i].class;

            blockPages[i].querySelector('.room').value = settingsCache[i].room;

            blockPages[i].querySelector('.teacher').value =
                settingsCache[i].teacher;

            const lunchInput = blockPages[i].querySelector('.lunch');
            if (lunchInput) {
                lunchInput.value = settingsCache[i].lunch;
            }

            blockPages[i].querySelector('.color').value =
                settingsCache[i].color;

            blockPages[i].querySelector('.coloris').value =
                settingsCache[i].customColor;

            if (settingsCache[i].color === -1) {
                blockPages[i]
                    .querySelector('.color-picker')
                    .classList.add('is-shown');
            } else {
                blockPages[i]
                    .querySelector('.color-picker')
                    .classList.remove('is-shown');
            }

            writebackListenerLock = false;
        }
    };

    for (let i = 0; i < blockTabs.length; i += 1) {
        blockTabs[i].addEventListener('click', () => {
            blockPage = i;
            updateBlockTabs();
        });

        blockPages[i]
            .querySelector('.hasClass')
            .addEventListener('change', () => {
                if (writebackListenerLock) return;
                settingsCache[i].hasClass =
                    blockPages[i].querySelector('.hasClass').checked;
                if (settingsCache[i].hasClass) {
                    settingsCache[i].hasClass = true;
                } else {
                    settingsCache[i].hasClass = false;
                    settingsCache[i].lunch = 3;
                    settingsCache[i].color = 0;
                }
                write();
            });

        blockPages[i].querySelector('.class').addEventListener('input', () => {
            if (writebackListenerLock) return;
            settingsCache[i].class =
                blockPages[i].querySelector('.class').value;
            write();
        });

        blockPages[i].querySelector('.room').addEventListener('input', () => {
            if (writebackListenerLock) return;
            settingsCache[i].room = blockPages[i].querySelector('.room').value;

            write();
        });

        blockPages[i]
            .querySelector('.teacher')
            .addEventListener('input', () => {
                if (writebackListenerLock) return;
                settingsCache[i].teacher =
                    blockPages[i].querySelector('.teacher').value;
                write();
            });

        const lunchInput = blockPages[i].querySelector('.lunch');
        if (lunchInput) {
            lunchInput.addEventListener('input', () => {
                if (writebackListenerLock) return;
                settingsCache[i].lunch = parseInt(
                    blockPages[i].querySelector('.lunch').value,
                );
                write();
            });
        }

        blockPages[i].querySelector('.color').addEventListener('input', () => {
            if (writebackListenerLock) return;
            settingsCache[i].color = parseInt(
                blockPages[i].querySelector('.color').value,
            );

            write();
        });

        blockPages[i]
            .querySelector('.coloris')
            .addEventListener('input', () => {
                if (writebackListenerLock) return;
                settingsCache[i].customColor =
                    blockPages[i].querySelector('.coloris').value;
                write();
            });
    }

    updateBlockTabs();
    write();
    writeback();
});

['Advisory', 'WIN', 'Lion'].forEach((periodName) => {
    const card = document.querySelector(`.${periodName}`);

    // let settingsCache = {
    //     hasClass: true,
    //     lunch: -1,
    //     class: '',
    //     teacher: '',
    //     room: '',
    //     color: colorMappings[periodName],
    // };
    let settingsCache = JSON.parse(JSON.stringify(BlockSettings[periodName]));

    // Open/close
    card.querySelector('.card-header').addEventListener('click', () => {
        card.classList.toggle('is-closed');
    });

    const write = () => {
        BlockSettings[periodName] = settingsCache;

        draw();
        saveData();
        writeback();
    };

    let writebackListenerLock = false;

    const writeback = () => {
        writebackListenerLock = true;

        if (periodName === 'Advisory') {
            card.querySelector('.room').value = settingsCache.room;
        }

        card.querySelector('.color').value = settingsCache.color;

        card.querySelector('.coloris').value = settingsCache.customColor;

        if (settingsCache.color === -1) {
            card.querySelector('.color-picker').classList.add('is-shown');
        } else {
            card.querySelector('.color-picker').classList.remove('is-shown');
        }

        writebackListenerLock = false;
    };

    if (periodName === 'Advisory') {
        card.querySelector('.room').addEventListener('input', () => {
            if (writebackListenerLock) return;
            settingsCache.room = card.querySelector('.room').value;

            write();
        });
    }

    card.querySelector('.color').addEventListener('input', () => {
        if (writebackListenerLock) return;
        settingsCache.color = parseInt(card.querySelector('.color').value);

        write();
    });

    card.querySelector('.coloris').addEventListener('input', () => {
        if (writebackListenerLock) return;
        settingsCache.customColor = card.querySelector('.coloris').value;
        write();
    });

    write();
    writeback();
});

document
    .querySelector('.options-card .card-header')
    .addEventListener('click', () => {
        document.querySelector('.options-card').classList.toggle('is-closed');
    });

Coloris({
    el: '.coloris',
    theme: 'polaroid',
    alpha: false,
    defaultColor: '#ff0000',
});
