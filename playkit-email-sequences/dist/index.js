(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // global-externals:attio/client
  var require_client = __commonJS({
    "global-externals:attio/client"(exports, module) {
      module.exports = ATTIO_CLIENT_EXTENSION_SDK;
    }
  });

  // global-externals:react
  var require_react = __commonJS({
    "global-externals:react"(exports, module) {
      module.exports = React;
    }
  });

  // node_modules/react/cjs/react-jsx-runtime.development.js
  var require_react_jsx_runtime_development = __commonJS({
    "node_modules/react/cjs/react-jsx-runtime.development.js"(exports) {
      "use strict";
      (function() {
        function getComponentNameFromType(type) {
          if (null == type) return null;
          if ("function" === typeof type)
            return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
          if ("string" === typeof type) return type;
          switch (type) {
            case REACT_FRAGMENT_TYPE:
              return "Fragment";
            case REACT_PROFILER_TYPE:
              return "Profiler";
            case REACT_STRICT_MODE_TYPE:
              return "StrictMode";
            case REACT_SUSPENSE_TYPE:
              return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
              return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
              return "Activity";
          }
          if ("object" === typeof type)
            switch ("number" === typeof type.tag && console.error(
              "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
            ), type.$$typeof) {
              case REACT_PORTAL_TYPE:
                return "Portal";
              case REACT_CONTEXT_TYPE:
                return (type.displayName || "Context") + ".Provider";
              case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
              case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
              case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
              case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                  return getComponentNameFromType(type(innerType));
                } catch (x) {
                }
            }
          return null;
        }
        function testStringCoercion(value) {
          return "" + value;
        }
        function checkKeyStringCoercion(value) {
          try {
            testStringCoercion(value);
            var JSCompiler_inline_result = false;
          } catch (e) {
            JSCompiler_inline_result = true;
          }
          if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(
              JSCompiler_inline_result,
              "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
              JSCompiler_inline_result$jscomp$0
            );
            return testStringCoercion(value);
          }
        }
        function getTaskName(type) {
          if (type === REACT_FRAGMENT_TYPE) return "<>";
          if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)
            return "<...>";
          try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
          } catch (x) {
            return "<...>";
          }
        }
        function getOwner() {
          var dispatcher = ReactSharedInternals.A;
          return null === dispatcher ? null : dispatcher.getOwner();
        }
        function UnknownOwner() {
          return Error("react-stack-top-frame");
        }
        function hasValidKey(config) {
          if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return false;
          }
          return void 0 !== config.key;
        }
        function defineKeyPropWarningGetter(props, displayName) {
          function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = true, console.error(
              "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
              displayName
            ));
          }
          warnAboutAccessingKey.isReactWarning = true;
          Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: true
          });
        }
        function elementRefGetterWithDeprecationWarning() {
          var componentName = getComponentNameFromType(this.type);
          didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = true, console.error(
            "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
          ));
          componentName = this.props.ref;
          return void 0 !== componentName ? componentName : null;
        }
        function ReactElement(type, key, self, source, owner, props, debugStack, debugTask) {
          self = props.ref;
          type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type,
            key,
            props,
            _owner: owner
          };
          null !== (void 0 !== self ? self : null) ? Object.defineProperty(type, "ref", {
            enumerable: false,
            get: elementRefGetterWithDeprecationWarning
          }) : Object.defineProperty(type, "ref", { enumerable: false, value: null });
          type._store = {};
          Object.defineProperty(type._store, "validated", {
            configurable: false,
            enumerable: false,
            writable: true,
            value: 0
          });
          Object.defineProperty(type, "_debugInfo", {
            configurable: false,
            enumerable: false,
            writable: true,
            value: null
          });
          Object.defineProperty(type, "_debugStack", {
            configurable: false,
            enumerable: false,
            writable: true,
            value: debugStack
          });
          Object.defineProperty(type, "_debugTask", {
            configurable: false,
            enumerable: false,
            writable: true,
            value: debugTask
          });
          Object.freeze && (Object.freeze(type.props), Object.freeze(type));
          return type;
        }
        function jsxDEVImpl(type, config, maybeKey, isStaticChildren, source, self, debugStack, debugTask) {
          var children = config.children;
          if (void 0 !== children)
            if (isStaticChildren)
              if (isArrayImpl(children)) {
                for (isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)
                  validateChildKeys(children[isStaticChildren]);
                Object.freeze && Object.freeze(children);
              } else
                console.error(
                  "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
                );
            else validateChildKeys(children);
          if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
              return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error(
              'A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />',
              isStaticChildren,
              children,
              keys,
              children
            ), didWarnAboutKeySpread[children + isStaticChildren] = true);
          }
          children = null;
          void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
          hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
          if ("key" in config) {
            maybeKey = {};
            for (var propName in config)
              "key" !== propName && (maybeKey[propName] = config[propName]);
          } else maybeKey = config;
          children && defineKeyPropWarningGetter(
            maybeKey,
            "function" === typeof type ? type.displayName || type.name || "Unknown" : type
          );
          return ReactElement(
            type,
            children,
            self,
            source,
            getOwner(),
            maybeKey,
            debugStack,
            debugTask
          );
        }
        function validateChildKeys(node) {
          "object" === typeof node && null !== node && node.$$typeof === REACT_ELEMENT_TYPE && node._store && (node._store.validated = 1);
        }
        var React3 = require_react(), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler");
        Symbol.for("react.provider");
        var REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React3.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
          return null;
        };
        React3 = {
          "react-stack-bottom-frame": function(callStackForError) {
            return callStackForError();
          }
        };
        var specialPropKeyWarningShown;
        var didWarnAboutElementRef = {};
        var unknownOwnerDebugStack = React3["react-stack-bottom-frame"].bind(
          React3,
          UnknownOwner
        )();
        var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
        var didWarnAboutKeySpread = {};
        exports.Fragment = REACT_FRAGMENT_TYPE;
        exports.jsx = function(type, config, maybeKey, source, self) {
          var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
          return jsxDEVImpl(
            type,
            config,
            maybeKey,
            false,
            source,
            self,
            trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
            trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
          );
        };
        exports.jsxs = function(type, config, maybeKey, source, self) {
          var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
          return jsxDEVImpl(
            type,
            config,
            maybeKey,
            true,
            source,
            self,
            trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
            trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
          );
        };
      })();
    }
  });

  // node_modules/react/jsx-runtime.js
  var require_jsx_runtime = __commonJS({
    "node_modules/react/jsx-runtime.js"(exports, module) {
      "use strict";
      if (false) {
        module.exports = null;
      } else {
        module.exports = require_react_jsx_runtime_development();
      }
    }
  });

  // src/start-sequence-action.tsx
  var import_client2 = __toESM(require_client());

  // src/start-sequence-dialog.tsx
  var import_client = __toESM(require_client());
  var import_react = __toESM(require_react());

  // proxy-server-modules-plugin:./fetch-company-data.server
  async function fetch_company_data_default(...args) {
    return runServerFunction("fetch-company-data.server", args);
  }

  // proxy-server-modules-plugin:./fetch-email-templates.server
  async function fetch_email_templates_default(...args) {
    return runServerFunction("fetch-email-templates.server", args);
  }

  // proxy-server-modules-plugin:./start-sequence.server
  async function start_sequence_default(...args) {
    return runServerFunction("start-sequence.server", args);
  }

  // src/start-sequence-dialog.tsx
  var import_jsx_runtime = __toESM(require_jsx_runtime());
  function resolveTemplate({
    template,
    firstName,
    companyName
  }) {
    const subject = template.subject.replace("{{companyName}}", companyName).replace("{{firstName}}", firstName);
    const body = template.body.replace("{{companyName}}", companyName).replace("{{firstName}}", firstName);
    return { subject, body };
  }
  function TemplateSyncer({
    templateId,
    onSync
  }) {
    (0, import_react.useEffect)(() => {
      onSync(templateId);
    }, [templateId, onSync]);
    return import_react.default.createElement(import_react.default.Fragment);
  }
  function SequenceForm({
    companyData,
    templates,
    companyRecordId,
    hideDialog
  }) {
    const [submitError, setSubmitError] = (0, import_react.useState)(null);
    const lastTemplateRef = (0, import_react.useRef)(templates[0].id);
    const defaultTemplate = templates[0];
    const recipientOptions = companyData.people.map((person) => ({
      label: `${person.name} (${person.email})`,
      value: person.email
    }));
    const templateOptions = templates.map((t) => ({
      label: t.name,
      value: t.id
    }));
    const cadenceOptions = [
      { label: "Standard (1, 2, 2 business days)", value: "standard" },
      { label: "Delayed (1, 4, 4 business days)", value: "delayed" }
    ];
    const defaultRecipient = companyData.people[0];
    const defaultFirstName = defaultRecipient?.name.split(" ")[0] ?? "";
    const { subject: defaultSubject, body: defaultBody } = resolveTemplate({
      template: defaultTemplate,
      firstName: defaultFirstName,
      companyName: companyData.name
    });
    lastTemplateRef.current = defaultTemplate.id;
    const { Form, Combobox, TextInput, TextArea, SubmitButton, WithState, change } = (0, import_client.useForm)(
      {
        template: import_client.Forms.string(),
        cadence: import_client.Forms.string(),
        recipient: import_client.Forms.string(),
        cc: import_client.Forms.string().optional(),
        subject: import_client.Forms.string(),
        body: import_client.Forms.string().multiline()
      },
      {
        template: defaultTemplate.id,
        cadence: "standard",
        recipient: defaultRecipient?.email ?? "",
        cc: "",
        subject: defaultSubject,
        body: defaultBody
      }
    );
    const syncTemplate = (0, import_react.useCallback)(
      (currentTemplateId) => {
        if (currentTemplateId === lastTemplateRef.current) {
          return;
        }
        lastTemplateRef.current = currentTemplateId;
        const t = templates.find((tmpl) => tmpl.id === currentTemplateId);
        if (!t) {
          return;
        }
        const { subject, body } = resolveTemplate({
          template: t,
          firstName: defaultFirstName,
          companyName: companyData.name
        });
        change("subject", subject);
        change("body", body);
      },
      [templates, change, companyData.name, defaultFirstName]
    );
    const handleSubmit = async (values) => {
      setSubmitError(null);
      const selectedPerson = companyData.people.find((p) => p.email === values.recipient);
      const ccList = values.cc ? values.cc.split(",").map((e) => e.trim()).filter((e) => e.length > 0) : [];
      const payload = {
        recipientEmail: values.recipient,
        recipientName: selectedPerson?.name ?? "",
        cc: ccList,
        subject: values.subject,
        body: values.body,
        companyName: companyData.name,
        companyRecordId,
        cadence: values.cadence
      };
      try {
        const result = await start_sequence_default(payload);
        console.log(`[StartSequenceDialog] Success: ${result}`);
        hideDialog();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error(`[StartSequenceDialog] Submit failed: ${message}`);
        setSubmitError(message);
      }
    };
    if (companyData.people.length === 0) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_client.Banner, { variant: "warning", children: "No people with email addresses are linked to this company. Add team members in Attio first." });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Form, { onSubmit: handleSubmit, children: [
      submitError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_client.Banner, { variant: "error", children: [
        "Failed to send: ",
        submitError
      ] }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WithState, { values: true, children: ({ values }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TemplateSyncer, { templateId: values.template, onSync: syncTemplate }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        Combobox,
        {
          name: "template",
          label: "Template",
          options: templateOptions,
          searchPlaceholder: "Search templates..."
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        Combobox,
        {
          name: "cadence",
          label: "Cadence",
          options: cadenceOptions,
          searchPlaceholder: "Select cadence..."
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        Combobox,
        {
          name: "recipient",
          label: "Recipient",
          options: recipientOptions,
          searchPlaceholder: "Search people..."
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, { name: "cc", label: "CC", placeholder: "Comma-separated email addresses" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, { name: "subject", label: "Subject", placeholder: "Email subject line" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, { name: "body", label: "Body", resizable: true }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubmitButton, { label: "Send" })
    ] });
  }
  function SequenceFormLoader({
    companyRecordId,
    hideDialog
  }) {
    const {
      values: { companyData, templates }
    } = (0, import_client.useAsyncCache)({
      companyData: [fetch_company_data_default, companyRecordId],
      templates: fetch_email_templates_default
    });
    if (templates.length === 0) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_client.Banner, { variant: "error", children: "No email templates found. Please add templates in the app settings." });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      SequenceForm,
      {
        companyData,
        templates,
        companyRecordId,
        hideDialog
      }
    );
  }
  function ErrorFallback({ error }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_client.Banner, { variant: "error", children: [
      "Failed to load company data: ",
      error,
      ". Please close and try again."
    ] });
  }
  function StartSequenceDialog({
    recordId,
    hideDialog
  }) {
    const [error, setError] = (0, import_react.useState)(null);
    if (error) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorFallback, { error });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, { fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_client.LoadingState, {}), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorCatcher, { onError: setError, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SequenceFormLoader, { companyRecordId: recordId, hideDialog }) }) });
  }
  var ErrorCatcher = class extends import_react.default.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
      return { hasError: true };
    }
    componentDidCatch(error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("[StartSequenceDialog]", message);
      this.props.onError(message);
    }
    render() {
      if (this.state.hasError) {
        return null;
      }
      return this.props.children;
    }
  };

  // src/start-sequence-action.tsx
  var import_jsx_runtime2 = __toESM(require_jsx_runtime());
  var startEmailSequence = {
    id: "start-email-sequence",
    label: "Start email sequence",
    icon: "Email",
    onTrigger: async ({ recordId }) => {
      await (0, import_client2.showDialog)({
        title: "Start Email Sequence",
        Dialog: ({ hideDialog }) => {
          return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(StartSequenceDialog, { recordId, hideDialog });
        }
      });
    },
    objects: ["companies"]
  };

  // src/weather-forecast-action.tsx
  var import_client4 = __toESM(require_client());

  // src/weather-forecast-dialog.tsx
  var import_client3 = __toESM(require_client());
  var import_react2 = __toESM(require_react());

  // src/get-company-location-by-id.graphql
  var get_company_location_by_id_default = "query GetCompanyLocationById($recordId: String!) {\n  company(id: $recordId) {\n    primary_location {\n      latitude\n      longitude\n      country\n      locality\n    }\n  }\n}\n";

  // proxy-server-modules-plugin:./get-daily-forecast.server
  async function get_daily_forecast_default(...args) {
    return runServerFunction("get-daily-forecast.server", args);
  }

  // src/get-person-location-by-id.graphql
  var get_person_location_by_id_default = "query GetPersonLocationById($recordId: String!) {\n  person(id: $recordId) {\n    primary_location {\n      latitude\n      longitude\n      country\n      locality\n    }\n    company {\n      name\n      primary_location {\n        latitude\n        longitude\n        country\n        locality\n      }\n    }\n  }\n}\n";

  // src/weather-forecast-dialog.tsx
  var import_jsx_runtime3 = __toESM(require_jsx_runtime());
  var WMO_CODES = /* @__PURE__ */ new Map([
    [0, { description: "Clear sky", emoji: "\u2600\uFE0F" }],
    [1, { description: "Mainly clear", emoji: "\u{1F324}\uFE0F" }],
    [2, { description: "Partly cloudy", emoji: "\u26C5" }],
    [3, { description: "Overcast", emoji: "\u2601\uFE0F" }],
    [45, { description: "Fog", emoji: "\u{1F32B}\uFE0F" }],
    [48, { description: "Depositing rime fog", emoji: "\u{1F32B}\uFE0F" }],
    [51, { description: "Light drizzle", emoji: "\u{1F326}\uFE0F" }],
    [53, { description: "Moderate drizzle", emoji: "\u{1F326}\uFE0F" }],
    [55, { description: "Dense drizzle", emoji: "\u{1F326}\uFE0F" }],
    [56, { description: "Light freezing drizzle", emoji: "\u{1F9CA}" }],
    [57, { description: "Dense freezing drizzle", emoji: "\u{1F9CA}" }],
    [61, { description: "Slight rain", emoji: "\u{1F327}\uFE0F" }],
    [63, { description: "Moderate rain", emoji: "\u{1F327}\uFE0F" }],
    [65, { description: "Heavy rain", emoji: "\u{1F327}\uFE0F" }],
    [66, { description: "Light freezing rain", emoji: "\u{1F9CA}" }],
    [67, { description: "Heavy freezing rain", emoji: "\u{1F9CA}" }],
    [71, { description: "Slight snow fall", emoji: "\u2744\uFE0F" }],
    [73, { description: "Moderate snow fall", emoji: "\u2744\uFE0F" }],
    [75, { description: "Heavy snow fall", emoji: "\u2744\uFE0F" }],
    [77, { description: "Snow grains", emoji: "\u{1F328}\uFE0F" }],
    [80, { description: "Slight rain showers", emoji: "\u{1F326}\uFE0F" }],
    [81, { description: "Moderate rain showers", emoji: "\u{1F327}\uFE0F" }],
    [82, { description: "Violent rain showers", emoji: "\u26C8\uFE0F" }],
    [85, { description: "Slight snow showers", emoji: "\u{1F328}\uFE0F" }],
    [86, { description: "Heavy snow showers", emoji: "\u2744\uFE0F" }],
    [95, { description: "Thunderstorm", emoji: "\u{1F329}\uFE0F" }],
    [96, { description: "Thunderstorm with slight hail", emoji: "\u26C8\uFE0F" }],
    [99, { description: "Thunderstorm with heavy hail", emoji: "\u26C8\uFE0F" }]
  ]);
  function extractLocationData(primaryLocation, fallbackLocation) {
    const hasValidPrimary = primaryLocation?.latitude != null && primaryLocation?.longitude != null;
    const hasValidFallback = fallbackLocation?.latitude != null && fallbackLocation?.longitude != null;
    const location = hasValidPrimary ? primaryLocation : hasValidFallback ? fallbackLocation : null;
    if (!location) {
      return null;
    }
    return {
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      locality: location.locality != null ? location.locality : null,
      country: location.country != null ? location.country : null
    };
  }
  function formatLocationString(locality, country) {
    if (locality && country) {
      return `${locality}, ${country}`;
    }
    if (locality) {
      return locality;
    }
    if (country) {
      return country;
    }
    return null;
  }
  function getTemperatureBadgeColor(temperature, unit) {
    const tempInCelsius = unit === "fahrenheit" ? (temperature - 32) * 5 / 9 : temperature;
    if (tempInCelsius <= -20) return "cyan";
    if (tempInCelsius <= -10) return "blue";
    if (tempInCelsius <= 0) return "grey";
    if (tempInCelsius <= 10) return "lime";
    if (tempInCelsius <= 20) return "green";
    if (tempInCelsius <= 25) return "yellow";
    if (tempInCelsius <= 30) return "amber";
    if (tempInCelsius <= 35) return "orange";
    return "red";
  }
  function formatTemperature(temperature, unit) {
    return `${temperature} \xB0${unit[0].toUpperCase()}`;
  }
  function TemperatureBadge({ temperature, unit }) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_client3.Badge, { color: getTemperatureBadgeColor(temperature, unit), children: formatTemperature(temperature, unit) });
  }
  function toRecordLocation(locationData) {
    const formattedLocation = formatLocationString(locationData.locality, locationData.country);
    const location = formattedLocation ?? `${locationData.latitude}, ${locationData.longitude}`;
    return {
      ...locationData,
      location
    };
  }
  function PersonForecast({ recordId }) {
    const { person } = (0, import_client3.useQuery)(get_person_location_by_id_default, { recordId });
    const locationData = extractLocationData(
      person?.primary_location,
      person?.company?.primary_location
    );
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ForecastResult, { locationData });
  }
  function CompanyForecast({ recordId }) {
    const { company } = (0, import_client3.useQuery)(get_company_location_by_id_default, { recordId });
    const locationData = extractLocationData(company?.primary_location);
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ForecastResult, { locationData });
  }
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];
  function formatDate(timestamp) {
    const date = new Date(timestamp * 1e3);
    const day = DAYS[date.getUTCDay()];
    const month = MONTHS[date.getUTCMonth()];
    return `${day}, ${date.getUTCDate()} ${month}`;
  }
  function ForecastTableHeader() {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_client3.Table.Header, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_client3.Table.HeaderCell, { children: "Date" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_client3.Table.HeaderCell, { children: "Weather" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_client3.Table.HeaderCell, { children: "Temp. (Max/Min)" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_client3.Table.HeaderCell, { children: "Precipitation" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_client3.Table.HeaderCell, { children: "Wind" })
    ] });
  }
  function ForecastFooter() {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_client3.Divider, {}),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_client3.Typography.Body, { children: [
        "Weather data provided by ",
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_client3.Link, { href: "https://open-meteo.com", children: "open-meteo.com" })
      ] })
    ] });
  }
  function ForecastContent({
    latitude,
    longitude,
    location
  }) {
    const temperatureUnit = "fahrenheit";
    const {
      values: { forecast }
    } = (0, import_client3.useAsyncCache)({
      forecast: [get_daily_forecast_default, latitude, longitude, temperatureUnit]
    });
    const locationTitle = `Location: ${location}`;
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_client3.Section, { title: locationTitle, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_client3.Table, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ForecastTableHeader, {}),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_client3.Table.Body, { children: forecast.daily.time.map((timestamp, index) => {
          const weatherCode = forecast.daily.weather_code[index];
          const tempMax = Math.round(forecast.daily.temperature_2m_max[index]);
          const tempMin = Math.round(forecast.daily.temperature_2m_min[index]);
          const precipitation = forecast.daily.precipitation_sum[index];
          const precipProb = forecast.daily.precipitation_probability_max[index];
          const windSpeed = Math.round(forecast.daily.wind_speed_10m_max[index]);
          const weatherInfo = WMO_CODES.get(weatherCode);
          const weatherEmoji = weatherInfo?.emoji || "\u{1F308}";
          const weatherDesc = weatherInfo?.description || "Unknown";
          return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_client3.Table.Row, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_client3.Table.Cell, { children: formatDate(timestamp) }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_client3.Table.Cell, { children: [
              weatherEmoji,
              " ",
              weatherDesc
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_client3.Table.Cell, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                TemperatureBadge,
                {
                  temperature: tempMax,
                  unit: temperatureUnit
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                TemperatureBadge,
                {
                  temperature: tempMin,
                  unit: temperatureUnit
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_client3.Table.Cell, { children: [
              precipitation.toFixed(1),
              " ",
              forecast.daily_units.precipitation_sum,
              " (",
              precipProb,
              "%)"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_client3.Table.Cell, { children: [
              windSpeed,
              " ",
              forecast.daily_units.wind_speed_10m_max
            ] })
          ] }, timestamp);
        }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ForecastFooter, {})
    ] });
  }
  function ForecastResult({ locationData }) {
    if (!locationData) {
      return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_client3.Section, { title: "Weather Forecast", children: "No location data available for this record." });
    }
    const recordLocation = toRecordLocation(locationData);
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_react2.Suspense, { fallback: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_client3.LoadingState, {}), children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      ForecastContent,
      {
        latitude: recordLocation.latitude,
        longitude: recordLocation.longitude,
        location: recordLocation.location
      }
    ) });
  }
  function WeatherForecastDialog({
    object,
    recordId
  }) {
    if (object === "people") {
      return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(PersonForecast, { recordId });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(CompanyForecast, { recordId });
  }

  // src/weather-forecast-action.tsx
  var import_jsx_runtime4 = __toESM(require_jsx_runtime());
  var showWeatherForecast = {
    id: "show-weather-forecast",
    label: "Show weather forecast",
    icon: "Sun",
    onTrigger: async ({ recordId, object }) => {
      await (0, import_client4.showDialog)({
        title: "7-Day Weather Forecast",
        Dialog: () => {
          return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(WeatherForecastDialog, { object, recordId });
        }
      });
    },
    objects: ["people", "companies"]
  };

  // src/app.settings.ts
  var settingsSchema = {
    workspace: {}
  };
  var app_settings_default = settingsSchema;

  // src/app.ts
  var app = {
    record: {
      /** @see https://docs.attio.com/sdk/entry-points/record-action  */
      actions: [showWeatherForecast, startEmailSequence],
      /** @see https://docs.attio.com/sdk/entry-points/bulk-record-action */
      bulkActions: [],
      /** @see https://docs.attio.com/sdk/entry-points/record-widget */
      widgets: []
    },
    callRecording: {
      /** @see https://docs.attio.com/sdk/entry-points/call-recording-insight-text-selection-action */
      insight: {
        textActions: []
      },
      /** @see https://docs.attio.com/sdk/entry-points/call-recording-summary-text-selection-action */
      summary: {
        textActions: []
      },
      /** @see https://docs.attio.com/sdk/entry-points/call-recording-transcript-text-selection-action */
      transcript: {
        textActions: []
      }
    },
    /** @see https://docs.attio.com/sdk/entry-points/workspace-settings */
    settings: {}
  };

  // ../../../../private/var/folders/cr/34cvn9s16cx908kpzrghwbxc0000gn/T/tmp-71037-r38tHriW0A7B-.js
  registerSettingsSchema(app_settings_default);
  var recordActions = app?.record?.actions;
  var bulkRecordActions = app?.record?.bulkActions;
  var recordWidgets = app?.record?.widgets;
  var callRecordingInsights = app?.callRecording?.insight?.textActions;
  var callRecordingSummaries = app?.callRecording?.summary?.textActions;
  var callRecordingTranscripts = app?.callRecording?.transcript?.textActions;
  var workflowStepBlocks = app?.workflow?.blocks?.steps;
  var workflowTriggerBlocks = app?.workflow?.blocks?.triggers;
  var workspaceSettings = app?.settings?.workspace;
  registerSurfaces({
    "record-action": Array.isArray(recordActions) ? recordActions : [],
    "bulk-record-action": Array.isArray(bulkRecordActions) ? bulkRecordActions : [],
    "record-widget": Array.isArray(recordWidgets) ? recordWidgets : [],
    "call-recording-insight-text-selection-action": Array.isArray(callRecordingInsights) ? callRecordingInsights : [],
    "call-recording-summary-text-selection-action": Array.isArray(callRecordingSummaries) ? callRecordingSummaries : [],
    "call-recording-transcript-text-selection-action": Array.isArray(callRecordingTranscripts) ? callRecordingTranscripts : [],
    "workflow-block": [
      ...Array.isArray(workflowStepBlocks) ? workflowStepBlocks.map((block) => ({ type: "step", id: block.id, block })) : [],
      ...Array.isArray(workflowTriggerBlocks) ? workflowTriggerBlocks.map((block) => ({ type: "trigger", id: block.id, block })) : []
    ],
    "workspace-settings": workspaceSettings ? [workspaceSettings] : []
  });
})();
/*! Bundled license information:

react/cjs/react-jsx-runtime.development.js:
  (**
   * @license React
   * react-jsx-runtime.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
