(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- footer year ---------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- mobile nav ---------------- */
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  var mobileNavClose = document.getElementById("mobileNavClose");

  function openMobileNav() {
    mobileNav.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeMobileNav() {
    mobileNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  if (navToggle) navToggle.addEventListener("click", openMobileNav);
  if (mobileNavClose) mobileNavClose.addEventListener("click", closeMobileNav);
  if (mobileNav) {
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMobileNav);
    });
  }

  /* ---------------- scroll reveal ---------------- */
  var revealTargets = document.querySelectorAll(".reveal, .file-card");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealTargets.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------------- case file modals ---------------- */
  var openTrigger = null;

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    var closeBtn = modal.querySelector(".file-modal-close");
    if (closeBtn) closeBtn.focus();
    document.addEventListener("keydown", onModalKeydown);
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onModalKeydown);
    if (openTrigger) {
      openTrigger.focus();
      openTrigger = null;
    }
  }

  function onModalKeydown(e) {
    if (e.key === "Escape") {
      var open = document.querySelector(".file-modal.is-open");
      closeModal(open);
    }
  }

  document.querySelectorAll("[data-modal]").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      openTrigger = trigger;
      var modal = document.getElementById(trigger.getAttribute("data-modal"));
      openModal(modal);
    });
  });

  document.querySelectorAll("[data-close]").forEach(function (closer) {
    closer.addEventListener("click", function () {
      closeModal(closer.closest(".file-modal"));
    });
  });

  /* ---------------- portfolio request form ---------------- */
  /*
    This form posts to Formspree (https://formspree.io). It works two ways:

    1. WITH JavaScript (below): submission happens over fetch() without a
       page reload, and shows the success/error states in place.
    2. WITHOUT JavaScript: the <form> still has a real action="" and
       method="POST", so it submits normally to Formspree and Formspree
       shows its own confirmation page. Nothing depends on JS to work.

    SETUP REQUIRED: open index.html, find the <form id="portfolioForm">
    tag, and replace REPLACE_WITH_YOUR_FORM_ID in its action="" attribute
    with your real Formspree form ID. That's the only step needed.

    Prefer EmailJS, Google Forms, or a serverless function instead?
    Swap the fetch() call below for that service's send method — the
    disable/success/error handling around it can stay as-is.
  */
  var form = document.getElementById("portfolioForm");
  var success = document.getElementById("formSuccess");
  var errorBox = document.getElementById("formError");
  var submitBtn = document.getElementById("formSubmitBtn");
  var isSubmitting = false;

  function setFormMessage(state) {
    success.classList.toggle("is-visible", state === "success");
    errorBox.classList.toggle("is-visible", state === "error");
    var toFocus = state === "success" ? success : state === "error" ? errorBox : null;
    if (toFocus) toFocus.focus();
  }

  if (form && submitBtn) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (isSubmitting) return; // belt-and-braces guard against double submits
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var endpointConfigured = form.getAttribute("action").indexOf("REPLACE_WITH_YOUR_FORM_ID") === -1;
      if (!endpointConfigured) {
        console.warn(
          "Portfolio form: replace REPLACE_WITH_YOUR_FORM_ID in the form's action attribute " +
          "with a real Formspree form ID before this can send anywhere. See README.md."
        );
        setFormMessage("error");
        return;
      }

      isSubmitting = true;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      setFormMessage(null);

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      })
        .then(function (response) {
          if (response.ok) {
            setFormMessage("success");
            form.reset();
            submitBtn.textContent = "Request Sent";
            // stays disabled: one request is enough, prevents accidental resubmission
          } else {
            return response.json().then(function () {
              throw new Error("Form service returned an error");
            });
          }
        })
        .catch(function (err) {
          console.error("Portfolio form submission failed:", err);
          setFormMessage("error");
          submitBtn.disabled = false;
          submitBtn.textContent = "Request Portfolio";
        })
        .finally(function () {
          isSubmitting = false;
        });
    });
  }
})();
