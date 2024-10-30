export class Modal {
  constructor(modalId, contentId) {
    this.modal = document.getElementById(modalId);
    this.form = document.getElementById(contentId);
    this.initEventListeners();
  }

  initEventListeners() {
    const span = this.modal.querySelector('.close');
    if (span) {
      span.addEventListener('click', () => {
        this.hide();
      });
    }

    window.onclick = event => {
      if (event.target === this.modal) {
        this.hide();
      }
    }
  }

  async show(contentForm) {
    this.form.innerHTML = await contentForm.getHtml();
    contentForm.afterRender();
    this.modal.style.display = "block";
  }

  hide() {
    this.modal.style.display = "none";
  }
}