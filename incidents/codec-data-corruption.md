# Incident: Delimited Data Corruption

- **Date**: 2026-09-05
- **Repository**: adbrain
- **Severity**: High
- **Status**: Resolved by preserving list values through an explicit encoding boundary

## Symptom

A user-entered list value containing the chosen separator is split into multiple values after persistence or restoration.

## Trigger sequence

Enter a value containing the delimiter, save it through the list serializer, reload it, and compare the restored values with the original.

## Evidence

AdBrain's delimiter regression coverage demonstrates that list serialization must preserve delimiter-containing values instead of assuming the separator is absent.

## Root cause

A lossy string representation was used without escaping, length-prefixing, or a structured serialization format.

## Fix

Choose a representation with an explicit codec contract and test round trips for delimiters, empty values, Unicode, malformed input, and boundaries.

## Regression coverage

The focused list serialization tests assert semantic equality after encode/decode, including values containing the delimiter.

## Residual risk

Changing a persisted format requires migration or backward-compatible decoding for existing records.

## Portable lesson

Use [codec-invertibility-tests](../skills/codec-invertibility-tests.md) for every user-data conversion.
