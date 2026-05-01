#!/bin/bash
#
# Decision Framework Skill
# Apply structured thinking frameworks to complex decisions
#

set -e

FRAMEWORK=""
DECISION=""
SAVE=false
VERBOSE=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

usage() {
    echo "Decision Framework Skill"
    echo ""
    echo "Usage: $0 --framework <type> --decision <text> [options]"
    echo ""
    echo "Frameworks:"
    echo "  six-hats        Six Thinking Hats (multi-perspective analysis)"
    echo "  first-principles First Principles thinking (break down fundamentals)"
    echo "  eisenhower      Eisenhower Matrix (urgent vs important)"
    echo "  pros-cons       Simple weighted pros/cons"
    echo "  pre-mortem      Imagine it failed, work backwards"
    echo ""
    echo "Options:"
    echo "  --save          Log decision to memory"
    echo "  --verbose       Detailed output"
    echo "  --help          Show this help"
    exit 1
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --framework)
            FRAMEWORK="$2"
            shift 2
            ;;
        --decision)
            DECISION="$2"
            shift 2
            ;;
        --save)
            SAVE=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help)
            usage
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

# Validate inputs
if [[ -z "$FRAMEWORK" ]] || [[ -z "$DECISION" ]]; then
    echo -e "${RED}Error: --framework and --decision are required${NC}"
    usage
fi

# Header
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}           ${YELLOW}🧠 DECISION FRAMEWORK SKILL${NC}                    ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Framework: ${GREEN}$FRAMEWORK${NC}"
echo -e "Decision: ${YELLOW}$DECISION${NC}"
echo ""

# Framework implementations
run_six_hats() {
    echo -e "${CYAN}┌────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│${NC}  🎩 SIX THINKING HATS — Multi-Perspective Analysis        ${CYAN}│${NC}"
    echo -e "${CYAN}└────────────────────────────────────────────────────────────┘${NC}"
    echo ""
    
    echo -e "${YELLOW}⬜ WHITE HAT — Facts and Data${NC}"
    echo "What are the objective facts? What data do we have?"
    echo "   • What information do we know for certain?"
    echo "   • What information is missing?"
    echo "   • What historical data is relevant?"
    echo ""
    echo "[Agent: Pause here to gather facts or continue to next hat]"
    echo ""
    
    echo -e "${RED}❤️ RED HAT — Emotions and Intuition${NC}"
    echo "What are your gut feelings? No justification needed."
    echo "   • What's your immediate emotional reaction?"
    echo "   • What does your intuition tell you?"
    echo "   • What fears or hopes come up?"
    echo ""
    
    echo -e "${YELLOW}⚫ BLACK HAT — Caution and Risks${NC}"
    echo "What could go wrong? Be the devil's advocate."
    echo "   • What are the potential failures?"
    echo "   • What assumptions might be wrong?"
    echo "   • What's the worst-case scenario?"
    echo ""
    
    echo -e "${YELLOW}🟡 YELLOW HAT — Benefits and Optimism${NC}"
    echo "What's the upside? Why should we do this?"
    echo "   • What are the potential benefits?"
    echo "   • What opportunities does this create?"
    echo "   • What's the best-case scenario?"
    echo ""
    
    echo -e "${GREEN}🟢 GREEN HAT — Creativity and Alternatives${NC}"
    echo "What other possibilities exist? Think outside the box."
    echo "   • What creative alternatives are there?"
    echo "   • How might others solve this?"
    echo "   • What if resources weren't a constraint?"
    echo ""
    
    echo -e "${BLUE}🔵 BLUE HAT — Process Control and Decision${NC}"
    echo "Synthesize and decide."
    echo "   • What does all this thinking tell us?"
    echo "   • What's the final decision?"
    echo "   • What are the next steps?"
    echo ""
}

run_first_principles() {
    echo -e "${CYAN}┌────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│${NC}  🔬 FIRST PRINCIPLES — Break Down to Fundamentals         ${CYAN}│${NC}"
    echo -e "${CYAN}└────────────────────────────────────────────────────────────┘${NC}"
    echo ""
    
    echo -e "${YELLOW}Step 1: Identify Current Approach${NC}"
    echo "What is the conventional way this problem is handled?"
    echo ""
    
    echo -e "${YELLOW}Step 2: Question Assumptions${NC}"
    echo "List all assumptions. Which ones can be challenged?"
    echo "   • What are we assuming is true?"
    echo "   • What 'best practices' are we following blindly?"
    echo "   • What constraints are self-imposed?"
    echo ""
    
    echo -e "${YELLOW}Step 3: Find Fundamental Truths${NC}"
    echo "Strip away assumptions. What's irreducibly true?"
    echo "   • What physics/economics/math principles apply?"
    echo "   • What must be true regardless of current approach?"
    echo "   • What are the raw inputs and desired outputs?"
    echo ""
    
    echo -e "${YELLOW}Step 4: Build From Scratch${NC}"
    echo "If you had to solve this with zero preconceptions:"
    echo "   • How would you design the solution?"
    echo "   • What would be the optimal approach?"
    echo "   • How does this compare to current methods?"
    echo ""
    
    echo -e "${GREEN}Step 5: Synthesize New Solution${NC}"
    echo "Combine first-principles thinking with practical constraints."
    echo ""
}

run_eisenhower() {
    echo -e "${CYAN}┌────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│${NC}  📊 EISENHOWER MATRIX — Urgent vs. Important             ${CYAN}│${NC}"
    echo -e "${CYAN}└────────────────────────────────────────────────────────────┘${NC}"
    echo ""
    
    echo "                    URGENT              NOT URGENT"
    echo "               ┌─────────────────┬─────────────────┐"
    echo "               │ ${RED}DO FIRST${NC}        │ ${BLUE}SCHEDULE${NC}        │"
    echo "  IMPORTANT    │ • Crises        │ • Planning      │"
    echo "               │ • Deadlines     │ • Development   │"
    echo "               │ • Problems      │ • Relationship  │"
    echo "               ├─────────────────┼─────────────────┤"
    echo "               │ ${YELLOW}DELEGATE${NC}        │ ${GREEN}ELIMINATE${NC}       │"
    echo "NOT IMPORTANT │ • Interruptions │ • Busy work     │"
    echo "               │ • Some meetings │ • Time wasters  │"
    echo "               │ • Some emails   │ • Escapism      │"
    echo "               └─────────────────┴─────────────────┘"
    echo ""
    
    echo -e "${YELLOW}For your decision:${NC}"
    echo "Categorize each option into the matrix above."
    echo "Focus energy on Quadrant 2 (Important, Not Urgent) for long-term success."
    echo ""
}

run_pros_cons() {
    echo -e "${CYAN}┌────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│${NC}  ⚖️ PROS/CONS — Weighted Decision Analysis                 ${CYAN}│${NC}"
    echo -e "${CYAN}└────────────────────────────────────────────────────────────┘${NC}"
    echo ""
    
    echo -e "${GREEN}PROS (Benefits)${NC}                           | ${RED}CONS (Costs/Risks)${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━|━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "                                         |"
    echo "List benefits with weights (1-5):         | List costs/risks with weights (1-5):"
    echo "  • Benefit 1 [3]                         |   • Cost/Risk 1 [4]"
    echo "  • Benefit 2 [5]                         |   • Cost/Risk 2 [2]"
    echo "  • Benefit 3 [2]                         |   • Cost/Risk 3 [3]"
    echo "                                         |"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━|━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "TOTAL: Sum of weighted pros              | TOTAL: Sum of weighted cons${NC}"
    echo ""
    echo "If Pros > Cons: Proceed"
    echo "If Cons > Pros: Reconsider or find mitigation"
    echo "If Equal: Need more information or creative alternatives"
    echo ""
}

run_pre_mortem() {
    echo -e "${CYAN}┌────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│${NC}  🔮 PRE-MORTEM — Imagine Failure, Work Backwards          ${CYAN}│${NC}"
    echo -e "${CYAN}└────────────────────────────────────────────────────────────┘${NC}"
    echo ""
    
    echo "It's one year from now. The decision led to failure."
    echo ""
    echo -e "${RED}Step 1: The Headline${NC}"
    echo "Write the failure headline: 'PROJECT X FAILED BECAUSE...'"
    echo ""
    
    echo -e "${YELLOW}Step 2: Root Cause Analysis${NC}"
    echo "What specifically caused the failure? List 3-5 causes:"
    echo "   • Cause 1: ___________________"
    echo "   • Cause 2: ___________________"
    echo "   • Cause 3: ___________________"
    echo ""
    
    echo -e "${GREEN}Step 3: Prevention Strategies${NC}"
    echo "For each cause, how could it have been prevented?"
    echo "   • Prevention for Cause 1: ___________________"
    echo "   • Prevention for Cause 2: ___________________"
    echo "   • Prevention for Cause 3: ___________________"
    echo ""
    
    echo -e "${BLUE}Step 4: Go/No-Go Decision${NC}"
    echo "Given what you now know about potential failures:"
    echo "   • Can the major risks be mitigated?"
    echo "   • Is the upside worth the remaining risk?"
    echo "   • Should you proceed, pivot, or abandon?"
    echo ""
}

# Run selected framework
case $FRAMEWORK in
    six-hats|six_hats|6hats)
        run_six_hats
        ;;
    first-principles|first_principles|fundamentals)
        run_first_principles
        ;;
    eisenhower|matrix|urgent-important)
        run_eisenhower
        ;;
    pros-cons|pros_cons|weighted)
        run_pros_cons
        ;;
    pre-mortem|pre_mortem|premortem)
        run_pre_mortem
        ;;
    *)
        echo -e "${RED}Error: Unknown framework '$FRAMEWORK'${NC}"
        echo "Run with --help to see available frameworks."
        exit 1
        ;;
esac

# Footer
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ "$SAVE" = true ]; then
    echo -e "${GREEN}💾 Decision logged to memory${NC}"
    echo "   Framework: $FRAMEWORK"
    echo "   Decision: $DECISION"
    echo "   Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    echo ""
    echo "Use memory search to retrieve past decisions."
else
    echo -e "${YELLOW}💡 Tip:${NC} Run with --save to log this decision to persistent memory"
fi

echo ""
echo -e "${CYAN}✨ Decision framework complete${NC}"
echo ""
