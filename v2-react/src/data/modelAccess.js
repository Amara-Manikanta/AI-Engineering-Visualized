/**
 * Practical guidance per model family: when to pick it, how to reach it, and a
 * minimal working call. Lineup and licence facts stay in modelProfiles.js; this
 * file only adds the "how do I use it" layer.
 *
 * Model IDs change often. Each sample says where to get the current one.
 */

export const ACCESS = {
  claude: {
    good: ["Coding and long-running agent work", "Careful instruction following and long documents", "Tool use, computer use and MCP integrations"],
    look: ["You need the weights on your own hardware", "Very high-volume, low-cost classification"],
    api: "Claude API (Anthropic SDKs for Python, TypeScript and more); Claude apps and Claude Code",
    hosts: "Amazon Bedrock, Google Cloud Vertex AI, Microsoft Foundry",
    local: "Not possible: weights are not released",
    codeLang: "python",
    code: `import anthropic

client = anthropic.Anthropic()          # reads ANTHROPIC_API_KEY
message = client.messages.create(
    model="claude-opus-5-5",            # current IDs: docs.anthropic.com → Models
    max_tokens=500,
    messages=[{"role": "user", "content": "Explain RAG in two sentences."}],
)
print(message.content[0].text)`,
    licence: ["Proprietary: usage is governed by Anthropic's terms and usage policy.", "Nothing to download, so there is no licence to comply with on weights."],
  },
  gpt: {
    good: ["A broad ecosystem: apps, plug-ins, fine-tuning and tooling", "Agentic and computer-use work in OpenAI's own stack", "gpt-oss when you want open weights you can self-host"],
    look: ["You need the flagship models' weights (they are API-only)", "You want one vendor-neutral, permissively licensed stack"],
    api: "OpenAI API (official SDKs) and ChatGPT",
    hosts: "Microsoft Foundry (Azure OpenAI Service)",
    local: "gpt-oss models only (Apache 2.0), through Hugging Face, Ollama or vLLM",
    codeLang: "python",
    code: `from openai import OpenAI

client = OpenAI()                       # reads OPENAI_API_KEY
response = client.responses.create(
    model="MODEL_ID",                   # copy a current ID from platform.openai.com → Models
    input="Explain RAG in two sentences.",
)
print(response.output_text)`,
    licence: ["GPT-6 models: proprietary, API only.", "gpt-oss: Apache 2.0, so commercial use and modification are allowed."],
  },
  gemini: {
    good: ["Very long context and multimodal input (text, images, audio, video)", "Tight fit with Google Cloud and Workspace", "Fast, inexpensive Flash-tier models"],
    look: ["You need downloadable weights (use Gemma instead)", "You want to avoid a single-cloud dependency"],
    api: "Gemini API (Google AI Studio keys) and the Gemini app",
    hosts: "Google Cloud Vertex AI",
    local: "Not possible for Gemini itself; Gemma is the open sibling",
    codeLang: "python",
    code: `from google import genai

client = genai.Client()                 # reads GEMINI_API_KEY
response = client.models.generate_content(
    model="gemini-2.5-flash",           # swap for the current Flash or Pro ID in Google's model list
    contents="Explain RAG in two sentences.",
)
print(response.text)`,
    licence: ["Proprietary: governed by Google's API terms.", "Weights are not released."],
  },
  llama: {
    good: ["Fine-tuning and self-hosting with a huge tooling ecosystem", "Data that must stay on your own infrastructure", "Wide availability across clouds and runtimes"],
    look: ["You need an OSI-style permissive licence for Llama 3 or 4 (Muse Glimmer is Apache 2.0)", "You are a very large consumer service (extra terms above 700M monthly users)"],
    api: "Hosted by many providers; Meta also offers its own access, check current availability",
    hosts: "Amazon Bedrock, Google Vertex AI, Microsoft Foundry, plus inference providers",
    local: "Hugging Face (accept the licence first), Ollama, llama.cpp, vLLM",
    codeLang: "python",
    code: `from transformers import pipeline

# Gated model: accept the licence on Hugging Face, then run: huggingface-cli login
pipe = pipeline(
    "text-generation",
    model="meta-llama/Llama-3.1-8B-Instruct",
    torch_dtype="auto",
    device_map="auto",
)
messages = [{"role": "user", "content": "Explain RAG in two sentences."}]
out = pipe(messages, max_new_tokens=150)
print(out[0]["generated_text"][-1]["content"])`,
    licence: ["Llama Community Licence: commercial use allowed, with an acceptable-use policy and extra terms above 700 million monthly users.", "Not an open-source licence in the OSI sense. Read the current text for the version you use."],
  },
  qwen: {
    good: ["Multilingual work and strong coding at many sizes", "Apache-licensed weights you can fine-tune and ship", "Small models for edge devices up to very large mixtures of experts"],
    look: ["A Max or Plus tier that is API-only at launch", "Your policy limits models by country of origin"],
    api: "Alibaba Cloud Model Studio (DashScope) with an OpenAI-compatible endpoint",
    hosts: "Several inference providers and cloud marketplaces",
    local: "Hugging Face, ModelScope, Ollama, llama.cpp, vLLM",
    codeLang: "python",
    code: `from transformers import AutoModelForCausalLM, AutoTokenizer

name = "Qwen/Qwen3-8B"                  # pick the current size from the Qwen model cards
tok = AutoTokenizer.from_pretrained(name)
model = AutoModelForCausalLM.from_pretrained(name, torch_dtype="auto", device_map="auto")

messages = [{"role": "user", "content": "Explain RAG in two sentences."}]
text = tok.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
inputs = tok([text], return_tensors="pt").to(model.device)
out = model.generate(**inputs, max_new_tokens=300)
print(tok.decode(out[0][inputs.input_ids.shape[1]:], skip_special_tokens=True))`,
    licence: ["Apache 2.0 for the open releases: commercial use, modification and redistribution allowed with notices.", "Check each model card: API-only tiers are proprietary."],
  },
  deepseek: {
    good: ["Strong reasoning and coding at low API prices", "MIT-licensed weights, among the most permissive at this scale", "OpenAI-compatible API, so switching is easy"],
    look: ["You want to self-host the flagship: it needs a multi-GPU cluster", "Your data-residency rules restrict the hosted API"],
    api: "DeepSeek API (OpenAI-compatible)",
    hosts: "Several cloud and inference providers host the open weights",
    local: "Distilled and smaller variants run locally; the flagship needs a cluster (vLLM, SGLang)",
    codeLang: "python",
    code: `from openai import OpenAI

client = OpenAI(api_key="YOUR_DEEPSEEK_KEY", base_url="https://api.deepseek.com")
response = client.chat.completions.create(
    model="deepseek-chat",              # names change with releases: see api-docs.deepseek.com
    messages=[{"role": "user", "content": "Explain RAG in two sentences."}],
)
print(response.choices[0].message.content)`,
    licence: ["MIT: use, modify and sell with almost no restrictions beyond keeping the notice.", "Check the model card of each release; a few are under different terms."],
  },
  mistral: {
    good: ["A European vendor, with hosting options that suit EU data rules", "A mix of open (Apache 2.0) and hosted models", "Strong small and code-focused models"],
    look: ["You need one licence across the whole lineup: it varies by model", "You want the very largest frontier capability"],
    api: "La Plateforme (Mistral API) and Le Chat",
    hosts: "Amazon Bedrock, Google Vertex AI, Microsoft Foundry",
    local: "Open models via Hugging Face, Ollama, vLLM",
    codeLang: "python",
    code: `from mistralai import Mistral

client = Mistral(api_key="YOUR_MISTRAL_KEY")
response = client.chat.complete(
    model="mistral-large-latest",       # "-latest" aliases follow the current release
    messages=[{"role": "user", "content": "Explain RAG in two sentences."}],
)
print(response.choices[0].message.content)`,
    licence: ["Varies by model: many are Apache 2.0, some use Mistral's own research or commercial licences, and some are API only.", "Always read the licence on the specific model card before shipping."],
  },
  grok: {
    good: ["Real-time information through X and web search", "A large-context, fast API", "Older Grok weights if you only need to study or self-host them"],
    look: ["You need current models' weights (they are closed)", "You want the broadest third-party tooling"],
    api: "xAI API (OpenAI-compatible) and Grok in X",
    hosts: "Some cloud marketplaces; check current availability",
    local: "Only older released generations (Grok-1 under Apache 2.0)",
    codeLang: "python",
    code: `from openai import OpenAI

client = OpenAI(api_key="YOUR_XAI_KEY", base_url="https://api.x.ai/v1")
response = client.chat.completions.create(
    model="grok-4",                     # use the current ID from docs.x.ai
    messages=[{"role": "user", "content": "Explain RAG in two sentences."}],
)
print(response.choices[0].message.content)`,
    licence: ["Current models: proprietary, API only.", "Grok-1 base weights: Apache 2.0. Later released older weights have their own terms; read them."],
  },
  gemma: {
    good: ["Small, capable open models for laptops, phones and single GPUs", "Apache 2.0 from Gemma 4, so few licence worries", "Multimodal and multilingual at small sizes"],
    look: ["You need frontier-level reasoning (use Gemini)", "You are on Gemma 1 to 3, which used Google's own terms"],
    api: "Hosted by Google AI Studio and Vertex AI, and by many inference providers",
    hosts: "Google Cloud Vertex AI and third-party hosts",
    local: "Hugging Face, Ollama, llama.cpp, LM Studio, on-device runtimes",
    codeLang: "python",
    code: `import ollama                       # after: ollama pull gemma3:4b

response = ollama.chat(
    model="gemma3:4b",                  # swap the tag for the current Gemma release in the Ollama library
    messages=[{"role": "user", "content": "Explain RAG in two sentences."}],
)
print(response.message.content)`,
    licence: ["Apache 2.0 from Gemma 4.", "Gemma 1 to 3 used the Gemma Terms of Use, with use restrictions; check which generation you download."],
  },
  phi: {
    good: ["Strong reasoning for its size: laptops and edge devices", "MIT licence: about as permissive as it gets", "Cheap fine-tuning and experiments"],
    look: ["Broad world knowledge (small models know fewer facts)", "Very long documents or many-step agent tasks"],
    api: "Azure AI Foundry model catalogue; also on Hugging Face Inference providers",
    hosts: "Microsoft Foundry",
    local: "Hugging Face, Ollama, ONNX Runtime and Windows on-device tools",
    codeLang: "python",
    code: `from transformers import pipeline

pipe = pipeline("text-generation", model="microsoft/phi-4", torch_dtype="auto", device_map="auto")
messages = [{"role": "user", "content": "Explain RAG in two sentences."}]
out = pipe(messages, max_new_tokens=150)
print(out[0]["generated_text"][-1]["content"])`,
    licence: ["MIT: use, modify and sell with almost no restrictions beyond keeping the notice.", "Confirm on the model card of the exact Phi version."],
  },
  commandr: {
    good: ["Retrieval-augmented generation with built-in citations", "Enterprise use across many languages", "Command A+ weights under Apache 2.0"],
    look: ["Older Command R+ weights: non-commercial licence", "You want the largest general-purpose reasoning model"],
    api: "Cohere API (Python, TypeScript and other SDKs)",
    hosts: "Amazon Bedrock, Microsoft Foundry, Oracle Cloud and others",
    local: "Open weights on Hugging Face, with the licence caveat below",
    codeLang: "python",
    code: `import cohere

co = cohere.ClientV2(api_key="YOUR_COHERE_KEY")
response = co.chat(
    model="command-a-03-2025",          # swap for the current Command ID in Cohere's model list
    messages=[{"role": "user", "content": "Explain RAG in two sentences."}],
)
print(response.message.content[0].text)`,
    licence: ["Command A+: Apache 2.0, free for commercial use.", "Command R+ (older): CC-BY-NC, non-commercial; production use needs a Cohere licence."],
  },
};
