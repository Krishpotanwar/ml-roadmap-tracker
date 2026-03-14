/**
 * roadmapData.js
 * ─────────────────────────────────────────────────────────────
 * Static tree parsed from ml_roadmap.txt.
 * In a CI pipeline, this would be auto-generated at build time
 * by a Node.js parser script (scripts/parseRoadmap.js).
 *
 * Shape:
 *   Phase[]
 *     id: string          — stable slug used as localStorage key
 *     num: string         — "00" – "09"
 *     title: string
 *     subtitle: string
 *     checkpoint: string  — newline-separated lines
 *     sections: Section[]
 *       label: string
 *       items: Item[]
 *         id: string      — stable, unique across all phases
 *         text: string
 *         important?: boolean
 */

export const PHASES = [
  {
    id: "phase-00", num: "00",
    title: "Prerequisites",
    subtitle: "Foundation Layer: Math + Python",
    checkpoint: "You can implement linear regression using only NumPy — no sklearn.",
    sections: [
      { label: "Linear Algebra", items: [
        { id: "la-1", text: "Vectors & matrices — shapes, notation" },
        { id: "la-2", text: "Matrix multiplication & dot product" },
        { id: "la-3", text: "Eigenvalues & eigenvectors (intuition)" },
        { id: "la-4", text: "Tensor dimensions & reshaping" },
      ]},
      { label: "Calculus", items: [
        { id: "ca-1", text: "Derivatives & partial derivatives" },
        { id: "ca-2", text: "Chain rule — this IS backpropagation" },
        { id: "ca-3", text: "Gradient — direction of steepest ascent" },
      ]},
      { label: "Probability & Statistics", items: [
        { id: "ps-1", text: "Gaussian / Normal distribution" },
        { id: "ps-2", text: "Expectation, variance, standard deviation" },
        { id: "ps-3", text: "Likelihood & cross-entropy loss" },
      ]},
      { label: "NumPy for ML", items: [
        { id: "np-1", text: "Vectorization — no Python loops in ML code" },
        { id: "np-2", text: "Broadcasting rules" },
        { id: "np-3", text: "Advanced indexing tricks" },
        { id: "np-4", text: "Memory layout & efficiency" },
      ]},
    ],
  },
  {
    id: "phase-01", num: "01",
    title: "From-Scratch ML",
    subtitle: "Classical algorithms — no sklearn allowed",
    checkpoint: "You can train models without any ML library.\nYou understand gradient descent deeply.",
    sections: [
      { label: "Study Repo", items: [
        { id: "01-r1", text: "homemade-machine-learning (GitHub)" },
      ]},
      { label: "Implement", items: [
        { id: "01-i1", text: "Linear Regression — MSE cost + gradient descent" },
        { id: "01-i2", text: "Multivariate Linear Regression (matrix form)" },
        { id: "01-i3", text: "Logistic Regression — sigmoid + decision boundary" },
        { id: "01-i4", text: "K-Means Clustering — centroid optimization" },
        { id: "01-i5", text: "Gaussian Anomaly Detection — PDF-based" },
      ]},
      { label: "Understand", items: [
        { id: "01-u1", text: "Cost functions & their partial derivatives" },
        { id: "01-u2", text: "Data leakage — the silent killer of ML projects", important: true },
        { id: "01-u3", text: "Bias-variance tradeoff + evaluation metrics" },
      ]},
    ],
  },
  {
    id: "phase-02", num: "02",
    title: "Deep Learning Fundamentals",
    subtitle: "Neural networks from scratch — NumPy only",
    checkpoint: "You understand backpropagation completely.\nYou can write it from scratch.",
    sections: [
      { label: "Study Repo", items: [
        { id: "02-r1", text: "numpy-deep-learning (GitHub)" },
      ]},
      { label: "Learn", items: [
        { id: "02-l1", text: "Forward pass — layer by layer computation" },
        { id: "02-l2", text: "Backward pass — chain rule at scale" },
        { id: "02-l3", text: "Activation functions — ReLU, sigmoid, tanh" },
        { id: "02-l4", text: "Loss functions — cross-entropy, MSE" },
        { id: "02-l5", text: "Optimizers — SGD, Adam, RMSProp" },
        { id: "02-l6", text: "Weight initialization strategies" },
      ]},
      { label: "Build", items: [
        { id: "02-b1", text: "MLP for MNIST (~94% accuracy, pure NumPy)" },
        { id: "02-b2", text: "Minimal neural network framework from scratch" },
      ]},
    ],
  },
  {
    id: "phase-03", num: "03",
    title: "PyTorch Mastery",
    subtitle: "Modern deep learning — autograd + GPU",
    checkpoint: "You can train deep models from scratch in PyTorch.\nAutograd is no longer magic.",
    sections: [
      { label: "Core Concepts", items: [
        { id: "03-c1", text: "Autograd — how PyTorch computes gradients" },
        { id: "03-c2", text: "Tensor operations & GPU acceleration (.cuda())" },
        { id: "03-c3", text: "DataLoaders, Datasets, transforms" },
        { id: "03-c4", text: "Training loop — forward, loss, backward, step" },
        { id: "03-c5", text: "Model checkpointing & loading" },
        { id: "03-c6", text: "Mixed precision training (fp16 / bf16)" },
      ]},
      { label: "Projects", items: [
        { id: "03-p1", text: "CNN for image classification (CIFAR-10)" },
        { id: "03-p2", text: "RNN / LSTM for text generation" },
        { id: "03-p3", text: "Transfer learning with pretrained ResNet" },
      ]},
    ],
  },
  {
    id: "phase-04", num: "04",
    title: "Transformers & LLMs",
    subtitle: "Attention is all you need — for real",
    checkpoint: "You understand how ChatGPT works at the weights level.\nYou could build a tiny one.",
    sections: [
      { label: "Study Repos", items: [
        { id: "04-r1", text: "LLMs-from-scratch by Sebastian Raschka (GitHub)" },
        { id: "04-r2", text: "The Annotated Transformer — Harvard NLP (line-by-line)" },
      ]},
      { label: "Learn", items: [
        { id: "04-l1", text: "Tokenization — BPE, tiktoken" },
        { id: "04-l2", text: "Token embeddings + positional encoding" },
        { id: "04-l3", text: "Scaled Dot-Product Attention: softmax(QKᵀ / √dk) × V" },
        { id: "04-l4", text: "Multi-head attention — why multiple heads?" },
        { id: "04-l5", text: "Causal masking (decoder-only / GPT style)" },
        { id: "04-l6", text: "LayerNorm, GELU, Residual connections" },
        { id: "04-l7", text: "Full transformer block architecture" },
        { id: "04-l8", text: "Pretraining loss — cross-entropy on next token" },
      ]},
      { label: "Implement", items: [
        { id: "04-i1", text: "GPT-style model from scratch in PyTorch" },
        { id: "04-i2", text: "Small text generator — train on custom corpus" },
        { id: "04-i3", text: "Fine-tune with LoRA (Parameter-Efficient Fine-Tuning)" },
      ]},
    ],
  },
  {
    id: "phase-05", num: "05",
    title: "Paper Implementations",
    subtitle: "Research to code. The real engineering test.",
    checkpoint: "You can open an ML paper and turn it into working code.\nThis skill is rare.",
    sections: [
      { label: "Study Repos", items: [
        { id: "05-r1", text: "lucidrains (GitHub) — pick 2-3 paper repos" },
        { id: "05-r2", text: "vision_transformer — official JAX/Flax ViT" },
        { id: "05-r3", text: "Diffusion models from scratch" },
      ]},
      { label: "Skills", items: [
        { id: "05-s1", text: "Read a ML paper end-to-end (math + experiments)" },
        { id: "05-s2", text: "Einstein summation — einsum for tensor contractions" },
        { id: "05-s3", text: "Vision Transformer — patch embeddings, no convolutions" },
        { id: "05-s4", text: "MLP-Mixer — spatial + channel mixing (linear in pixels)" },
        { id: "05-s5", text: "Implement a paper from scratch without tutorial help" },
        { id: "05-s6", text: "Debug deep models — gradient flow, NaN, dead ReLU" },
      ]},
    ],
  },
  {
    id: "phase-06", num: "06",
    title: "Computer Vision (YOLO)",
    subtitle: "Production-grade object detection",
    checkpoint: "You can build and deploy a real-time object detection system.",
    sections: [
      { label: "Study Repo", items: [
        { id: "06-r1", text: "ultralytics / YOLO (GitHub) — up to YOLOv11" },
      ]},
      { label: "Learn", items: [
        { id: "06-l1", text: "FPN + PANet — multi-scale feature extraction" },
        { id: "06-l2", text: "Task-Aligned Learning (TAL) — dynamic anchor assignment" },
        { id: "06-l3", text: "Distributional Bounding Box Loss" },
        { id: "06-l4", text: "TensorRT / ONNX export for edge inference" },
        { id: "06-l5", text: "SPPF — Spatial Pyramid Pooling Fast" },
      ]},
      { label: "Build", items: [
        { id: "06-b1", text: "Train YOLO on a custom dataset" },
        { id: "06-b2", text: "Evaluate with mAP, precision, recall curves" },
      ]},
    ],
  },
  {
    id: "phase-07", num: "07",
    title: "Reinforcement Learning",
    subtitle: "Agents that learn by doing",
    checkpoint: "You can train RL agents and read algorithm diffs in a single file.",
    sections: [
      { label: "Study Repos", items: [
        { id: "07-r1", text: "CleanRL — single-file implementations (start here)" },
        { id: "07-r2", text: "Stable Baselines3 — modular, tuned hyperparams" },
      ]},
      { label: "Algorithms", items: [
        { id: "07-a1", text: "Markov Decision Processes — states, actions, rewards" },
        { id: "07-a2", text: "Q-Learning & DQN — Deep Q-Network" },
        { id: "07-a3", text: "Policy Gradient methods — REINFORCE" },
        { id: "07-a4", text: "PPO — Proximal Policy Optimization" },
        { id: "07-a5", text: "SAC — Soft Actor-Critic (off-policy)" },
        { id: "07-a6", text: "Environment interaction — OpenAI Gymnasium" },
      ]},
      { label: "Build", items: [
        { id: "07-b1", text: "Train PPO agent on CartPole / Atari" },
        { id: "07-b2", text: "Compare CleanRL vs SB3 on same environment" },
      ]},
    ],
  },
  {
    id: "phase-08", num: "08",
    title: "RAG & Agentic AI",
    subtitle: "Dynamic, data-aware AI applications",
    checkpoint: "You can build production-grade AI applications — not just demos.",
    sections: [
      { label: "RAG Techniques", items: [
        { id: "08-t1", text: "Naive RAG — chunk, embed, retrieve, generate" },
        { id: "08-t2", text: "HyDE — Hypothetical Document Embedding" },
        { id: "08-t3", text: "Fusion Retrieval — vector search + cross-encoder rerank" },
        { id: "08-t4", text: "GraphRAG — entity extraction and community summaries" },
        { id: "08-t5", text: "HyPE — precomputed hypothetical query embeddings" },
        { id: "08-t6", text: "Vector databases — Chroma, Pinecone, Weaviate" },
      ]},
      { label: "Agentic AI", items: [
        { id: "08-ag1", text: "Multi-agent orchestration patterns" },
        { id: "08-ag2", text: "Tool use — function calling, API integration" },
        { id: "08-ag3", text: "Evaluation-Driven Development — Logfire / LangSmith", important: true },
      ]},
      { label: "Build", items: [
        { id: "08-b1", text: "Document Q&A system with Advanced RAG" },
        { id: "08-b2", text: "Autonomous research agent with tool use" },
      ]},
    ],
  },
  {
    id: "phase-09", num: "09",
    title: "Production ML Engineering",
    subtitle: "MLOps — from script to scalable system",
    checkpoint: "You are an AI Engineer, not just an AI user.\nYou build systems, not just models.",
    sections: [
      { label: "MLOps Stack", items: [
        { id: "09-m1", text: "MLflow — experiment tracking, parameters, artifacts" },
        { id: "09-m2", text: "Ray — distributed training without changing Python logic" },
        { id: "09-m3", text: "CI/CD with GitHub Actions — auto train + evaluate on PR" },
        { id: "09-m4", text: "Model serving & inference APIs" },
        { id: "09-m5", text: "Monitoring & drift detection — Logfire / Prometheus" },
        { id: "09-m6", text: "LiteLLM Proxy — load balancing across LLM providers" },
      ]},
      { label: "Infrastructure", items: [
        { id: "09-i1", text: "Containerization with Docker" },
        { id: "09-i2", text: "Cloud clusters — AWS / GCP / Anyscale" },
        { id: "09-i3", text: "Kubernetes for ML serving" },
      ]},
      { label: "Best Practices", items: [
        { id: "09-bp1", text: '"Golden Set" testing — systematic evaluation, not vibes', important: true },
        { id: "09-bp2", text: "System architecture > model choice (senior-level insight)" },
        { id: "09-bp3", text: "Weekly GitHub commits with clear READMEs" },
      ]},
    ],
  },
]

/** Flatten all item IDs across all phases */
export const getAllItemIds = () =>
  PHASES.flatMap(p => p.sections.flatMap(s => s.items.map(i => i.id)))
