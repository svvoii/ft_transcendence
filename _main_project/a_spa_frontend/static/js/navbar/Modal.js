export class Modal {
  constructor(buttonId, contentForm) {
    this.button = document.getElementById(buttonId);
    this.modal = document.getElementById("formModal");
    this.form = document.getElementById("modalContent");
    this.initEventListeners();
    this.contentForm = contentForm;
  }

  initEventListeners() {
    this.button.addEventListener('click', async(event) =>{
      if (event.target === this.button || this.button.contains(event.target)) {
        this.show();
        this.form.innerHTML = await this.contentForm.getHtml();
        this.contentForm.afterRender();
      }
    });

    const span = this.modal.querySelector('.close');
    span.addEventListener('click', () => {
      this.hide();
    });

    window.onclick = event => {
      if (event.target === this.modal) {
        this.hide();
      }
    }
  }

  show() {
    console.log("showing modal");
    this.modal.style.display = "block";
  }

  hide() {
    console.log("hiding modal");
    this.modal.style.display = "none";
  }
}