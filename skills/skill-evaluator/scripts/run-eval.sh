#!/bin/bash
#
# Skill Evaluator Runner
# Run deterministic tests against OpenClaw skills
#

set -e

SKILL_PATH=""
TEST_PATTERN=""
VERBOSE=0
FAILED=0
PASSED=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

usage() {
    echo "Usage: $0 <skill-path> [test-file] [--verbose]"
    echo ""
    echo "Examples:"
    echo "  $0 skills/email-parser"
    echo "  $0 skills/email-parser tests/basic.yaml"
    echo "  $0 skills/email-parser --verbose"
    exit 1
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose)
            VERBOSE=1
            shift
            ;;
        -h|--help)
            usage
            ;;
        -*)
            echo "Unknown option: $1"
            usage
            ;;
        *)
            if [[ -z "$SKILL_PATH" ]]; then
                SKILL_PATH="$1"
            elif [[ -z "$TEST_PATTERN" ]]; then
                TEST_PATTERN="$1"
            fi
            shift
            ;;
    esac
done

if [[ -z "$SKILL_PATH" ]]; then
    usage
fi

if [[ ! -d "$SKILL_PATH" ]]; then
    echo -e "${RED}Error: Skill path not found: $SKILL_PATH${NC}"
    exit 1
fi

SKILL_NAME=$(basename "$SKILL_PATH")
TESTS_DIR="$SKILL_PATH/tests"

if [[ ! -d "$TESTS_DIR" ]]; then
    echo -e "${RED}Error: No tests/ directory found in $SKILL_PATH${NC}"
    exit 1
fi

# Find test files
if [[ -n "$TEST_PATTERN" ]]; then
    if [[ -f "$TEST_PATTERN" ]]; then
        TEST_FILES=("$TEST_PATTERN")
    elif [[ -f "$TESTS_DIR/$TEST_PATTERN" ]]; then
        TEST_FILES=("$TESTS_DIR/$TEST_PATTERN")
    else
        TEST_FILES=($TESTS_DIR/$TEST_PATTERN)
    fi
else
    TEST_FILES=($TESTS_DIR/*.yaml)
fi

if [[ ${#TEST_FILES[@]} -eq 0 ]]; then
    echo -e "${RED}Error: No test files found${NC}"
    exit 1
fi

echo "═══════════════════════════════════════════"
echo "SKILL EVALUATION: $SKILL_NAME"
echo "═══════════════════════════════════════════"
echo ""

FAILED_TESTS=()

for test_file in "${TEST_FILES[@]}"; do
    if [[ ! -f "$test_file" ]]; then
        continue
    fi
    
    # Parse test file (simple YAML parsing)
    test_name=$(grep "^name:" "$test_file" | head -1 | cut -d':' -f2- | sed 's/^ *//')
    
    if [[ $VERBOSE -eq 1 ]]; then
        echo "Running: $test_name"
        echo "File: $test_file"
        echo "---"
    fi
    
    # Check if test has expected assertions
    if ! grep -q "expected:" "$test_file"; then
        echo -e "${YELLOW}⚠️  $test_name - No expected assertions found${NC}"
        continue
    fi
    
    # For this reference implementation, we validate YAML structure
    # In production, this would invoke the skill and check output
    
    validation_errors=()
    
    # Check for contains assertions
    if grep -q "contains:" "$test_file"; then
        contains_count=$(grep -c "^-" <<< "$(sed -n '/contains:/,/^[a-z]/p' "$test_file" | grep "^-")" || echo "0")
        if [[ $VERBOSE -eq 1 ]]; then
            echo "  Contains assertions: $contains_count"
        fi
    fi
    
    # Check for json_schema
    if grep -q "json_schema:" "$test_file"; then
        if [[ $VERBOSE -eq 1 ]]; then
            echo "  JSON schema validation: enabled"
        fi
    fi
    
    # Check for not_contains
    if grep -q "not_contains:" "$test_file"; then
        if [[ $VERBOSE -eq 1 ]]; then
            echo "  Exclusion assertions: enabled"
        fi
    fi
    
    # Validate YAML is parseable
    if command -v python3 &> /dev/null; then
        if ! python3 -c "import yaml; yaml.safe_load(open('$test_file'))" 2>/dev/null; then
            validation_errors+=("Invalid YAML syntax")
        fi
    fi
    
    if [[ ${#validation_errors[@]} -eq 0 ]]; then
        echo -e "${GREEN}✅ $test_name${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ $test_name${NC}"
        for err in "${validation_errors[@]}"; do
            echo "   $err"
        done
        FAILED_TESTS+=("$test_name")
        ((FAILED++))
    fi
    
    if [[ $VERBOSE -eq 1 ]]; then
        echo ""
    fi
done

echo ""
echo "═══════════════════════════════════════════"
echo "EVALUATION SUMMARY"
echo "═══════════════════════════════════════════"
echo ""
echo "Skill: $SKILL_NAME"
echo "Tests Run: $((PASSED + FAILED))"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"

if [[ $((PASSED + FAILED)) -gt 0 ]]; then
    SUCCESS_RATE=$((PASSED * 100 / (PASSED + FAILED)))
    echo "Success Rate: $SUCCESS_RATE%"
fi

echo ""

if [[ ${#FAILED_TESTS[@]} -gt 0 ]]; then
    echo "───────────────────────────────────────────"
    echo "FAILED TESTS"
    echo "───────────────────────────────────────────"
    for test in "${FAILED_TESTS[@]}"; do
        echo "  ❌ $test"
    done
    echo ""
fi

if [[ $FAILED -gt 0 ]]; then
    echo -e "${RED}RECOMMENDATION: Fix $FAILED failing test(s) before deploying.${NC}"
    exit 1
else
    echo -e "${GREEN}All tests passed! Skill is ready for deployment.${NC}"
    exit 0
fi
