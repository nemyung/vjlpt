import{r as c,j as s,b as J,d as P,e as Z,s as h,f as j,g as H,m as R,i as $,k as p,l as C,n as K,o as O}from"./index-3XvheVGP.js";import{u as G}from"./index-DNfkk2nW.js";function E(e){var t,r,n="";if(typeof e=="string"||typeof e=="number")n+=e;else if(typeof e=="object")if(Array.isArray(e)){var i=e.length;for(t=0;t<i;t++)e[t]&&(r=E(e[t]))&&(n&&(n+=" "),n+=r)}else for(r in e)e[r]&&(n&&(n+=" "),n+=r);return n}function W(){for(var e,t,r=0,n="",i=arguments.length;r<i;r++)(e=arguments[r])&&(t=E(e))&&(n&&(n+=" "),n+=t);return n}/**
 * @license lucide-react v0.513.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),V=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,r,n)=>n?n.toUpperCase():r.toLowerCase()),L=e=>{const t=V(e);return t.charAt(0).toUpperCase()+t.slice(1)},M=(...e)=>e.filter((t,r,n)=>!!t&&t.trim()!==""&&n.indexOf(t)===r).join(" ").trim(),Y=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0};/**
 * @license lucide-react v0.513.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var ee={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.513.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const te=c.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:r=2,absoluteStrokeWidth:n,className:i="",children:l,iconNode:x,...u},_)=>c.createElement("svg",{ref:_,...ee,width:t,height:t,stroke:e,strokeWidth:n?Number(r)*24/Number(t):r,className:M("lucide",i),...!l&&!Y(u)&&{"aria-hidden":"true"},...u},[...x.map(([d,f])=>c.createElement(d,f)),...Array.isArray(l)?l:[l]]));/**
 * @license lucide-react v0.513.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=(e,t)=>{const r=c.forwardRef(({className:n,...i},l)=>c.createElement(te,{ref:l,iconNode:t,className:M(`lucide-${Q(L(e))}`,`lucide-${e}`,n),...i}));return r.displayName=L(e),r};/**
 * @license lucide-react v0.513.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const se=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],ne=b("check",se);/**
 * @license lucide-react v0.513.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const re=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],oe=b("chevron-left",re);/**
 * @license lucide-react v0.513.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ae=[["path",{d:"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",key:"1gvzjb"}],["path",{d:"M9 18h6",key:"x1upvd"}],["path",{d:"M10 22h4",key:"ceow96"}]],ce=b("lightbulb",ae);/**
 * @license lucide-react v0.513.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ie=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],le=b("x",ie),de="_outer_13754_1",ue="_hintButton_13754_13",pe="_expressionWrapper_13754_22",me="_expression_13754_22",he="_furigana_13754_36",ge="_meaning_13754_42",m={outer:de,hintButton:ue,expressionWrapper:pe,expression:me,furigana:he,meaning:ge};function xe({expression:e,furigana:t,meanings:r}){const[n,i]=c.useState("hide");return s.jsxs("div",{className:m.outer,children:[s.jsx("button",{className:m.hintButton,type:"button",onClick:()=>{i(l=>l==="hide"?"open":"hide")},children:s.jsx(ce,{})}),s.jsxs("div",{className:m.expressionWrapper,children:[s.jsx("p",{style:{opacity:n==="hide"?0:1},className:m.furigana,children:t}),s.jsx("p",{className:m.expression,children:e}),s.jsx("p",{style:{opacity:n==="hide"?0:1},className:m.meaning,children:r.join(", ")})]})]})}const _e=c.memo(xe,(e,t)=>e.id===t.id),fe="_container_7xmt1_1",ye="_header_7xmt1_7",je="_closeButton_7xmt1_15",Ce="_progressSection_7xmt1_22",be="_progressBarBackground_7xmt1_29",ve="_progressBarFill_7xmt1_37",we="_contentContainer_7xmt1_46",ke="_cardWrapper_7xmt1_52",Ne="_actionRow_7xmt1_58",Be="_actionCTA_7xmt1_76",Re="_study_7xmt1_88",Ie="_next_7xmt1_91",Se="_empty_7xmt1_95",Ae="_currentProgressSummary_7xmt1_106",Te="_ctaRow_7xmt1_114",Fe="_cta_7xmt1_114",o={container:fe,header:ye,closeButton:je,progressSection:Ce,progressBarBackground:be,progressBarFill:ve,contentContainer:we,cardWrapper:ke,actionRow:Ne,actionCTA:Be,study:Re,next:Ie,empty:Se,currentProgressSummary:Ae,ctaRow:Te,cta:Fe};async function Pe(e,t,r,n=10){return await e.select({...H(p),expression:j.expression,meanings:$`json_agg(${R.meaning})`}).from(p).innerJoin(j,C(p.expressionId,j.id)).innerJoin(R,C(p.id,R.readingId)).groupBy(p.id,j.expression).orderBy($`random()`).limit(n).where(K(C(p.levelId,t),O(p.id,e.select({readingId:h.readingId}).from(h).where(C(h.sessionId,r)))))}const Le=function(){const t=J(),r=P.useParams(),{flashcards:n,levelId:i}=P.useLoaderData(),l=Z(),x=()=>{navigator.vibrate(50),l.navigate({to:"/",replace:!0,viewTransition:{types:["slide-right"]}})},[u,_]=c.useState(n),[d,f]=c.useState(0),[v,I]=c.useTransition(),w=c.useRef(null),S=c.useRef(null),k=u.length,X=async()=>{navigator.vibrate(50),I(async()=>{var a;_(await Pe(t,i,r.sess)),f(0),(a=w.current)==null||a.style.setProperty("--current-progress","0")})},A=a=>{if(v||d>=k)return;const g=S.current,T=w.current;if(g===null||T===null)return;const N=a==="left"?"unknown":"known";I(async()=>{navigator.vibrate(50);const F=d+1,q=a==="left"?"-120%":"120%",z=a==="left"?"-15deg":"15deg",D=g.animate([{transform:"translateX(0) rotate(0deg)",opacity:"1"},{transform:`translateX(${q}) rotate(${z})`,opacity:"0"}],{duration:300,easing:"ease-out",fill:"forwards"});await Promise.all([Promise.resolve().then(()=>{T.style.setProperty("--current-progress",(F/k).toString())}),D.finished,t.insert(h).values({id:G(),sessionId:r.sess,readingId:u[d].id,status:N}).onConflictDoUpdate({target:[h.sessionId,h.readingId],set:{status:N}})]),_(U=>{const B=U.slice();return B[d]={...B[d],interactionStatus:N},B}),f(F)})},y=u.slice(d,d+3);return s.jsxs("div",{className:o.container,children:[s.jsxs("header",{className:o.header,children:[s.jsx("button",{type:"button",className:o.closeButton,onClick:x,children:s.jsx(oe,{})}),s.jsx("div",{className:o.progressSection,children:s.jsx("div",{className:o.progressBarBackground,children:s.jsx("div",{ref:w,className:o.progressBarFill})})})]}),s.jsx("div",{className:o.contentContainer,children:y.length>0?y.map((a,g)=>s.jsx("div",{className:o.cardWrapper,ref:g===0?S:null,style:{zIndex:3-g},children:s.jsx(_e,{...a})},a.id)):s.jsxs("div",{className:o.empty,children:[s.jsxs("div",{className:o.currentProgressSummary,children:[s.jsx("p",{children:"이번 학습을 모두 마쳤습니다"}),s.jsxs("p",{children:["총 ",k,"개의 카드를 학습했어요."]}),s.jsxs("p",{children:["그중"," ",s.jsxs("b",{children:[u.filter(a=>a.interactionStatus==="known").length,"개"]}),"를 안다고 체크했고,",s.jsx("br",{}),s.jsxs("b",{children:[u.filter(a=>a.interactionStatus==="unknown").length,"개"]}),"를 모른다고 체크했어요."]})]}),s.jsxs("div",{className:o.ctaRow,children:[s.jsx("button",{type:"button",className:o.cta,onClick:x,children:"그만하기"}),s.jsx("button",{type:"button",className:o.cta,onClick:X,children:"계속 학습하기"})]})]})}),s.jsxs("div",{className:o.actionRow,"data-is-empty":y.length===0,children:[s.jsx("button",{type:"button",onClick:()=>{A("left")},className:W(o.actionCTA,o.study),disabled:v||y.length===0,children:s.jsx(le,{})}),s.jsx("button",{type:"button",onClick:()=>{A("right")},className:W(o.actionCTA,o.next),disabled:v,children:s.jsx(ne,{})})]})]})};export{Le as component};
