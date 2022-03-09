import Page from "flarum/components/Page";
import IndexPage from "flarum/components/IndexPage";
import listItems from "flarum/helpers/listItems";
import Stream from "flarum/common/utils/Stream";
import Button from "flarum/common/components/Button";
import icon from "flarum/helpers/icon";

export default class ArticleRequestPage extends Page {
  oninit(vnode) {
    super.oninit(vnode);
    this.loading = false;
    this.message = Stream("");
    this.sent = false;
  }
  form() {
    if (!app.session.user) {
      return m("div", { class: "boxalignwarn" }, [
        m(
          "span",
          { class: "circlewarn" },
          m("span", m("i", { class: "fas fa-exclamation-triangle fa-2x" }))
        ),
        m("div", { class: "chartwarn" }, [
          m(
            "b",
            app.translator.trans("article-request.forum.plsregister")
          ),
          m(
            "div",
            app.translator.trans("article-request.forum.tocontinue")
          ),
        ]),
      ]);
    }
    if (this.sent) {
      return m("div", { class: "boxalign" }, [
        m(
          "span",
          { class: "circle" },
          m("span", m("i", { class: "fas fa-paper-plane fa-2x" }))
        ),
        m("div", { class: "chart" }, [
          m(
            "b",
            app.translator.trans("article-request.forum.messagesent")
          ),
          m("div", app.translator.trans("article-request.forum.backsoon")),
        ]),
      ]);
    }
    return m("form.Form-group", { onsubmit: this.submit.bind(this) }, [
      m("textarea.message1", {
        required: true,
        bidi: this.message,
        placeholder: app.translator.trans(
          "article-request.forum.textAreaField"
        ),
      }),
      m(
        "div",
        { class: "buttonHolder" },
        m(
          Button,
          { type: "submit", loading: this.loading, className: "Button" },
          app.translator.trans("article-request.forum.sendForm")
        )
      ),
    ]);
  }
  view() {
    return m(".IndexPage", [
      IndexPage.prototype.hero(),
      m(
        ".container",
        m(".sideNavContainer", [
          m(
            "nav.IndexPage-nav.sideNav",
            m("ul", listItems(IndexPage.prototype.sidebarItems().toArray()))
          ),
          m(
            ".IndexPage-results.sideNavOffset",
            m("div", { class: "iconcontainer" }, [
              m(
                "div",
                { class: "fontico" },
                m("i", { class: "fas fa-pencil-alt" })
              ),
              m(
                "div",
                { class: "icocont" },
                m(
                  "div",
                  { class: "titolo1" },
                  app.translator.trans("article-request.forum.pageTitle")
                )
              ),
            ]),
            m(
              "p",
              {
                class: "banner-message",
              },
              app.translator.trans("article-request.forum.pText")
            ),
            this.form()
          ),
        ])
      ),
    ]);
  }
  submit(e) {
    e.preventDefault();
    this.loading = true;
    m.redraw();
    app
      .request({
        method: "POST",
        url: app.forum.attribute("baseUrl") + "/sendmail",
        body: { message: this.message() },
      })
      .then(() => {
        this.loading = false;
        this.sent = true;
        m.redraw();
      });
  }
}
