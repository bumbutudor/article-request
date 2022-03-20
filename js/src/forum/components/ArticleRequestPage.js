import Page from "flarum/components/Page";
import IndexPage from "flarum/components/IndexPage";
import listItems from "flarum/helpers/listItems";
import Stream from "flarum/common/utils/Stream";
import Button from "flarum/common/components/Button";
import Select from 'flarum/common/components/Select';

export default class ArticleRequestPage extends Page {
  oninit(vnode) {
    super.oninit(vnode);
    this.loading = false;

    this.title = Stream("");
    this.topic = Stream("");
    this.selectedTags = [];
    this.tags = Stream("");
    this.mail = Stream("");
    this.guestName = Stream("");
    this.subjects = Stream("");
    this.allTags = [];
    this.tagIsLoaded = false;

    this.tagOptions = {
      'none': app.translator.trans("article-request.forum.none_tag_option"),
    }

    app.request({
      method: "GET",
      url: app.forum.attribute("baseUrl") + "/api/tags",
    })
    .then((tags) => {
      this.allTags = tags.data;
      this.tagIsLoaded = true;
      m.redraw();
    });

    this.sent = false;
  }

  form() {
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

    var emailPlaceholder = app.translator.trans("article-request.forum.email_placeholder");
    if (app.session.user) {
      emailPlaceholder += " (optional)";
    }

    return m("form.Form-group", { onsubmit: this.submit.bind(this) }, [
      m('.Form-group.field', [
        m('label', app.translator.trans("article-request.forum.title_label")),
        m('.helpText', app.translator.trans("article-request.forum.title_helpText")),
        m("input.FormControl", {
          bidi: this.title,
          placeholder: app.translator.trans("article-request.forum.title_placeholder"),
        }),
      ]),
      m('.Form-group.field', [
        m('label', app.translator.trans("article-request.forum.topic_label")),
        m('.helpText', app.translator.trans("article-request.forum.topic_helpText")),
        m("input.FormControl", {
          bidi: this.topic,
          placeholder: app.translator.trans("article-request.forum.topic_placeholder"),
        }),
      ]),
      m('.Form-group.field', [
        m('label', app.translator.trans("article-request.forum.tags_label")),
        m('.helpText', app.translator.trans("article-request.forum.tags_helpText")),
        m("input.FormControl", {
          value: this.tags(),
          placeholder: app.translator.trans("article-request.forum.tags_placeholder"),
          oninput: (e) => {
            this.tags(e.target.value);
            this.selectedTags = this.tags().split(",").map((el) => el.trim());
            this.allTags.map((tag) => {
              const slug = tag.attributes.slug;
              const name = tag.attributes.name;
  
              if (!this.selectedTags.includes(name)) {
                this.tagOptions[slug] = name;
              } else {
                delete this.tagOptions[slug];
              }
            });
          },
        }),
        Select.component({
          options: this.tagOptions,
          value: 'none',
          onchange: (e) => {
            this.allTags.map((tag) => {
              const slug = tag.attributes.slug;
              const name = tag.attributes.name;
              
              if (slug === e) {
                (this.tags() != "") ? this.tags(this.tags() + ", " + name) : this.tags(name);
                this.selectedTags = this.tags().split(",").map((el) => el.trim());
                delete this.tagOptions[slug];
              }
            });
          },
        }),
      ]),
      (!app.session.user) ?
        m('.Form-group.field', [
          m('label', app.translator.trans("article-request.forum.guestName_label")),
          m('.helpText', app.translator.trans("article-request.forum.guestName_helpText")),
          m("input.FormControl", {
            required: true,
            bidi: this.guestName,
            placeholder: app.translator.trans("article-request.forum.guestName_placeholder"),
          }),
        ]) : '',
      m('.Form-group.field', [
        m('label', app.translator.trans("article-request.forum.email_label")),
        m("input.FormControl", {
          type: "email",
          required: !app.session.user,
          bidi: this.mail,
          placeholder: emailPlaceholder,
        }),
      ]),
      m('.Form-group.field', [
        m('label', app.translator.trans("article-request.forum.subject_label")),
        m('.helpText', app.translator.trans("article-request.forum.subject_helpText")),
        m("textarea.message1", {
          required: true,
          bidi: this.subjects,
          placeholder: app.translator.trans("article-request.forum.subject_placeholder")
        }),
      ]),
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
    if (this.tagIsLoaded) {
      this.allTags.map((tag) => {
        const slug = tag.attributes.slug;
        const name = tag.attributes.name;
  
        this.tagOptions[slug] = name;
      });

      this.tagIsLoaded = false;
    }

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
                // m("i", { class: "fas fa-pencil-alt" })
              ),
              m(
                "div",
                { class: "icocont" },
                m(
                  "div",
                  { class: "titolo1" },
                  app.translator.trans("article-request.forum.title")
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
        body: {
          email: this.mail(),
          guestName: this.guestName(),
          title: this.title(),
          topic: this.topic(),
          tags: this.selectedTags.join(", "),
          subjects: this.subjects(),
        },
      })
      .then(() => {
        this.loading = false;
        this.sent = true;
        m.redraw();
      });
  }
}
