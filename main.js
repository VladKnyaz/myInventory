'use strict';
let cells = [
  { id: 1, idItem: null, isFull: false, type: null, value: null },
  { id: 2, idItem: 1, isFull: true, type: 'clothes', value: null },
  { id: 3, idItem: null, isFull: false, type: null, value: null },
  { id: 4, idItem: 4, isFull: true, type: 'bullets', value: 50 },
  { id: 5, idItem: 3, isFull: true, type: 'weapon', value: null },
  { id: 6, idItem: 6, isFull: true, type: 'bullets', value: 64 }, // Не правильный id предмета
  { id: 7, idItem: null, isFull: false, type: null, value: null },
  { id: 8, idItem: null, isFull: false, type: null, value: null },
  { id: 9, idItem: null, isFull: false, type: null, value: null },
  { id: 10, idItem: null, isFull: false, type: null, value: null },
];

let allItems = [
  { id: 1, name: 'Футболка от гучи', srcImg: 'img/t-shirt.svg', type: 'clothes' },
  { id: 2, name: 'Футболка от Влада', srcImg: 'img/t-shirt.svg', type: 'clothes' },
  {
    id: 3,
    name: 'Пистолет пулемёт',
    srcImg: 'img/weapon.svg',
    type: 'weapon',
    idWeapon: 'weapon_machinepistol',
  },
  { id: 4, name: 'Патроны 0.5мм', srcImg: 'img/bullets.svg', type: 'bullets' },
  { id: 5, name: 'Патроны 1мм', srcImg: 'img/bullets.svg', type: 'bullets' },
];

const inventory = document.querySelector('.inventory');

cells.map((cell) => {
  let div = document.createElement('div');
  div.className = 'cell';
  div.dataset.cellid = cell.id;

  if (cell.idItem > allItems.length) {
    // Если администратор ошибся с id предмета и такого нет, то ничего не будет
    // Запрос в базу данных на изменение сломаной ячейки                      ПЕРЕДЕЛАТЬ!
    cells[cell.id - 1] = { id: cell.id, idItem: null, isFull: false, type: null, value: null }; // Решение для фейк базы данных
    return inventory.append(div);
  }
  if (cell.isFull) {
    let itemInfo = allItems[cell.idItem - 1];

    if (cell.type !== 'bullets') {
      div.innerHTML = `
        <div class="item" draggable="true" data-cellId=${cell.id} data-itemId=${itemInfo.id}>
            <img draggable="false" src="${itemInfo.srcImg}" alt="" class="img" />
            <div class="name">${itemInfo.name}</div>
        </div>
      `;
    } else if (cell.type === 'bullets') {
      div.innerHTML = `
        <div class="item" draggable="true" data-cellId=${cell.id} data-itemId=${itemInfo.id}>
            <img draggable="false" src="${itemInfo.srcImg}" alt="" class="img" />
            <div class="name">${itemInfo.name}</div>
        </div>
      `;
      let itemDiv = div.querySelector('.item');
      itemDiv = $(itemDiv);
      itemDiv.after(`<span class='numbers' draggable="false">${cell.value}</span>`);
    }
  } else {
    //   div.innerHTML = `
    //       <div class="item" data-cellId=${cell.id} style="cursor: default">
    //           <img draggable="false" src=" " alt="" class="" />
    //       </div>
    // `;
  }
  inventory.append(div);
});

let items = document.querySelectorAll('.item');
let cellsDiv = document.querySelectorAll('.cell');

items.forEach((item) => {
  //                            Обработка предмета
  var itemCurrent;
  var valuesItem;
  var cellIdCurrent;

  function dragStart() {
    itemCurrent = this; // Получаем ячейку по которой кликнули
    valuesItem = this.nextElementSibling; // Проверка есть ли кол-во этого предмета
    cellIdCurrent = this.dataset.cellid; // Получаем id ячейка откуда начинаем перетаскивать предмет, что бы в дальнейшем можно было менять местами предметы и изменять саму базу данных

    setTimeout(() => {
      if (valuesItem !== null) valuesItem.classList.add('hide'); // Проверка есть ли кол-во этого предмета
      this.classList.add('hide');
    }, 0);
  }

  function dragEnd() {
    var valuesItem = this.nextElementSibling;
    if (valuesItem !== null) valuesItem.classList.remove('hide');
    this.classList.remove('hide');
  }

  item.addEventListener('dragstart', dragStart);
  item.addEventListener('dragend', dragEnd);

  //                            Обработка ячеек

  cellsDiv.forEach((cell) => {
    function dragOver(e) {
      e.preventDefault();
    }
    function dragEnter(e) {
      e.preventDefault();

      this.classList.add('hovered');
      // console.log(this.querySelector('.item'));
    }
    function dragLeave(e) {
      e.preventDefault();

      this.classList.remove('hovered');
    }
    function dragDrop(e) {
      if (!itemCurrent) return;
      // Иметируем запрос в базу данных и изменяем данные ячеек
      let cellDB = cells[this.dataset.cellid - 1];

      // Изменить на перемещение предметов
      if (cellDB.isFull) return;
      if (cellDB.isFull === undefined) return;
      cellDB.idItem = parseInt(itemCurrent.dataset.itemid);
      cellDB.isFull = true;
      cellDB.type = allItems[cellDB.idItem - 1].type;

      if (cellDB.type === 'bullets') {
        cellDB.value = parseInt(cells[cellIdCurrent - 1].value);
        console.log(cellDB.value);
      }

      // Обнуляем прошлую ячейку, где был предмет
      let oldCell = cells[cellIdCurrent - 1];
      let zeroObj = { id: oldCell.id, idItem: null, isFull: false, type: null, value: null };
      cells[cellIdCurrent - 1] = zeroObj;

      itemCurrent.dataset.cellid = cellDB.id;

      this.append(itemCurrent);
      itemCurrent = null;
      this.classList.remove('hovered');

      // Проверка есть ли у предмета его количество
      if (!valuesItem) return;
      if (valuesItem) {
        return this.append(valuesItem);
      }
    }

    cell.addEventListener('dragover', dragOver);
    cell.addEventListener('dragenter', dragEnter);
    cell.addEventListener('dragleave', dragLeave);
    cell.addEventListener('drop', dragDrop);
  });
});
